import { ConflictException } from '@nestjs/common';
import { CreateProductUseCase } from './create-product.use-case';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { SearchServicePort } from '../../domain/ports/search-service.port';
import { CreateProductDto } from '../dtos/create-product.dto';
import { Product } from '../../domain/models/product.model';

jest.mock('uuid', () => ({ v4: () => 'product-id' }));

const dto: CreateProductDto = {
  name: 'Gaming Laptop',
  description: 'Powerful laptop',
  price: 1299.99,
  stock: 50,
  category: 'Electronics',
  location: 'New York',
  subcategory: 'Computers',
};

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let repository: jest.Mocked<ProductRepositoryPort>;
  let searchService: jest.Mocked<SearchServicePort>;

  beforeEach(() => {
    repository = {
      save: jest.fn((product: Product) => Promise.resolve(product)),
      findByName: jest.fn().mockResolvedValue(null),
      findAll: jest.fn(),
    };
    searchService = {
      searchProducts: jest.fn(),
      indexProduct: jest.fn().mockResolvedValue(undefined),
      autocomplete: jest.fn(),
    };

    useCase = new CreateProductUseCase(repository, searchService);
  });

  it('crea el producto: lo indexa en Elasticsearch y luego lo guarda en PostgreSQL', async () => {
    const product = await useCase.execute(dto);

    expect(product).toMatchObject({ id: 'product-id', ...dto });
    expect(searchService.indexProduct).toHaveBeenCalledWith(product);
    expect(repository.save).toHaveBeenCalledWith(product);
    expect(searchService.indexProduct.mock.invocationCallOrder[0]).toBeLessThan(
      repository.save.mock.invocationCallOrder[0],
    );
  });

  it('rechaza un nombre duplicado con 409 y no escribe en ningún sistema', async () => {
    repository.findByName.mockResolvedValue({ id: 'existing' } as Product);

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(searchService.indexProduct).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('no guarda en PostgreSQL si falla la indexación', async () => {
    searchService.indexProduct.mockRejectedValue(new Error('Elasticsearch down'));

    await expect(useCase.execute(dto)).rejects.toThrow(
      'Failed to index product in search engine',
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
});
