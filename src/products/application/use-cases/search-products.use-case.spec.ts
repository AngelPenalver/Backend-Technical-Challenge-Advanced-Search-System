import type { Cache } from 'cache-manager';
import { SearchProductsUseCase } from './search-products.use-case';
import { SearchServicePort } from '../../domain/ports/search-service.port';
import { Product } from '../../domain/models/product.model';

/** Caché en memoria mínima: prueba el comportamiento real de get/set sin mockear cada llamada. */
class InMemoryCache {
  private readonly store = new Map<string, unknown>();
  get = jest.fn((key: string) => Promise.resolve(this.store.get(key)));
  set = jest.fn((key: string, value: unknown) => {
    this.store.set(key, value);
    return Promise.resolve(value);
  });
}

const laptop = { id: '1', name: 'Laptop' } as Product;

describe('SearchProductsUseCase', () => {
  let useCase: SearchProductsUseCase;
  let searchService: jest.Mocked<SearchServicePort>;
  let cache: InMemoryCache;

  beforeEach(() => {
    searchService = {
      searchProducts: jest.fn().mockResolvedValue([laptop]),
      indexProduct: jest.fn(),
      autocomplete: jest.fn(),
    };
    cache = new InMemoryCache();

    useCase = new SearchProductsUseCase(searchService, cache as unknown as Cache);
  });

  it('busca en Elasticsearch con los filtros recibidos cuando no hay caché', async () => {
    const result = await useCase.execute({
      category: 'Electronics',
      minPrice: 100,
      maxPrice: 500,
      limit: 10,
      offset: 0,
    });

    expect(result).toEqual([laptop]);
    expect(searchService.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Electronics',
        minPrice: 100,
        maxPrice: 500,
        limit: 10,
        offset: 0,
      }),
    );
    expect(cache.set).toHaveBeenCalledTimes(1);
  });

  it('devuelve la caché en la segunda búsqueda idéntica sin llamar a Elasticsearch', async () => {
    await useCase.execute({ category: 'Electronics' });
    const second = await useCase.execute({ category: 'Electronics' });

    expect(second).toEqual([laptop]);
    expect(searchService.searchProducts).toHaveBeenCalledTimes(1);
  });

  it('trata filtros distintos como entradas de caché distintas', async () => {
    await useCase.execute({ category: 'Electronics' });
    await useCase.execute({ category: 'Books' });

    expect(searchService.searchProducts).toHaveBeenCalledTimes(2);
  });

  it('no guarda en caché si la búsqueda falla', async () => {
    searchService.searchProducts.mockRejectedValue(new Error('Elasticsearch down'));

    await expect(useCase.execute({ category: 'Electronics' })).rejects.toThrow(
      'Elasticsearch down',
    );
    expect(cache.set).not.toHaveBeenCalled();
  });
});
