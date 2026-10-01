import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ElasticProductAdapter } from './elastic-product.adapter';
import { SearchQuery } from '../../domain/value-objects/search-query.vo';
import { Product } from '../../domain/models/product.model';

describe('ElasticProductAdapter', () => {
  let adapter: ElasticProductAdapter;
  let elasticsearch: { search: jest.Mock; index: jest.Mock };

  /** Ejecuta una búsqueda y devuelve la petición que se envió a Elasticsearch. */
  async function requestFor(searchQuery: SearchQuery) {
    await adapter.searchProducts(searchQuery);
    return elasticsearch.search.mock.calls[0][0];
  }

  beforeEach(() => {
    elasticsearch = {
      search: jest.fn().mockResolvedValue({ hits: { hits: [] } }),
      index: jest.fn().mockResolvedValue({}),
    };
    adapter = new ElasticProductAdapter(elasticsearch as unknown as ElasticsearchService);
  });

  describe('searchProducts', () => {
    it('con texto usa multi_match tolerante a errores y da más peso al nombre', async () => {
      const request = await requestFor({ q: 'laptop' });

      expect(request.query.bool.must).toEqual([
        { multi_match: { query: 'laptop', fields: ['name^2', 'description'], fuzziness: 'AUTO' } },
      ]);
    });

    it('sin texto devuelve todos los productos con match_all', async () => {
      const request = await requestFor({});

      expect(request.query.bool.must).toEqual([{ match_all: {} }]);
      expect(request.query.bool.filter).toEqual([]);
    });

    it('aplica categoría, subcategoría y ubicación como filtros exactos', async () => {
      const request = await requestFor({
        category: 'Electronics',
        subcategory: 'Computers',
        location: 'New York',
      });

      expect(request.query.bool.filter).toEqual(
        expect.arrayContaining([
          { term: { category: 'Electronics' } },
          { term: { subcategory: 'Computers' } },
          { term: { location: 'New York' } },
        ]),
      );
    });

    it('arma el rango de precio con los dos límites', async () => {
      const request = await requestFor({ minPrice: 100, maxPrice: 500 });

      expect(request.query.bool.filter).toEqual([{ range: { price: { gte: 100, lte: 500 } } }]);
    });

    it('incluye minPrice 0 aunque sea un valor falsy', async () => {
      const request = await requestFor({ minPrice: 0 });

      expect(request.query.bool.filter).toEqual([{ range: { price: { gte: 0 } } }]);
    });

    it('pasa la paginación como from y size', async () => {
      const request = await requestFor({ offset: 20, limit: 10 });

      expect(request).toMatchObject({ from: 20, size: 10 });
    });

    it.each<[string, SearchQuery, unknown]>([
      ['por relevancia si no se indica orden', {}, ['_score']],
      ['por relevancia explícita', { sort: 'relevance' }, ['_score']],
      ['por precio, ascendente por defecto', { sort: 'price' }, [{ price: { order: 'asc' } }]],
      ['por nombre usando el campo keyword', { sort: 'name', order: 'desc' }, [{ 'name.keyword': { order: 'desc' } }]],
    ])('ordena %s', async (_, searchQuery, expectedSort) => {
      const request = await requestFor(searchQuery);

      expect(request.sort).toEqual(expectedSort);
    });

    it('devuelve los documentos encontrados', async () => {
      const laptop = { name: 'Laptop', price: 999 };
      elasticsearch.search.mockResolvedValue({ hits: { hits: [{ _id: '1', _source: laptop }] } });

      await expect(adapter.searchProducts({ q: 'laptop' })).resolves.toEqual([
        expect.objectContaining(laptop),
      ]);
    });
  });

  describe('autocomplete', () => {
    it('busca por prefijo en el nombre y devuelve hasta 5 nombres', async () => {
      elasticsearch.search.mockResolvedValue({
        hits: { hits: [{ _source: { name: 'Laptop' } }, { _source: { name: 'Laptop Stand' } }] },
      });

      const names = await adapter.autocomplete({ text: 'lap' });

      expect(names).toEqual(['Laptop', 'Laptop Stand']);
      expect(elasticsearch.search).toHaveBeenCalledWith(
        expect.objectContaining({ size: 5, query: { match_phrase_prefix: { name: 'lap' } } }),
      );
    });
  });

  describe('indexProduct', () => {
    it('usa el id del producto como id del documento', async () => {
      const product = new Product(
        'product-id', 'Laptop', 'Fast', 999, 5, 'New York', 'Electronics', 'Computers', new Date(), new Date(),
      );

      await adapter.indexProduct(product);

      expect(elasticsearch.index).toHaveBeenCalledWith(
        expect.objectContaining({ index: 'products', id: 'product-id' }),
      );
    });
  });
});
