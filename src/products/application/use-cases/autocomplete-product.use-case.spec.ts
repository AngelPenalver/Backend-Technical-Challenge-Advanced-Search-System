import type { Cache } from 'cache-manager';
import { AutocompleteProductUseCase } from './autocomplete-product.use-case';
import { SearchServicePort } from '../../domain/ports/search-service.port';

describe('AutocompleteProductUseCase', () => {
  let useCase: AutocompleteProductUseCase;
  let searchService: jest.Mocked<SearchServicePort>;
  let cache: { get: jest.Mock; set: jest.Mock };

  beforeEach(() => {
    searchService = {
      searchProducts: jest.fn(),
      indexProduct: jest.fn(),
      autocomplete: jest.fn().mockResolvedValue(['Laptop', 'Laptop Stand']),
    };
    cache = { get: jest.fn().mockResolvedValue(undefined), set: jest.fn() };

    useCase = new AutocompleteProductUseCase(searchService, cache as unknown as Cache);
  });

  it('pide sugerencias a Elasticsearch y las guarda en caché', async () => {
    const result = await useCase.execute({ text: 'lap' });

    expect(result).toEqual(['Laptop', 'Laptop Stand']);
    expect(searchService.autocomplete).toHaveBeenCalledWith({ text: 'lap' });
    expect(cache.set).toHaveBeenCalledWith('lap', ['Laptop', 'Laptop Stand']);
  });

  it('devuelve las sugerencias en caché sin consultar Elasticsearch', async () => {
    cache.get.mockResolvedValue(['Laptop']);

    await expect(useCase.execute({ text: 'lap' })).resolves.toEqual(['Laptop']);
    expect(searchService.autocomplete).not.toHaveBeenCalled();
  });
});
