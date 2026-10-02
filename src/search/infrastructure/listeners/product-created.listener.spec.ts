import { ProductCreatedListener } from './product-created.listener';
import { IndexProductUseCase } from '../../application/use-cases/index-product.use-case';
import { ProductCreatedEvent } from 'src/product/events/product-created.event';
import { ProductEntity } from 'src/product/entities/product.entity';
import { Product } from '../../domain/models/product.model';

function buildEntity(): ProductEntity {
  return Object.assign(new ProductEntity(), {
    id: 'product-id',
    name: 'Gaming Laptop',
    description: 'Powerful laptop',
    price: '1299.99' as unknown as number,
    stock: 50,
    category: 'Electronics',
    location: 'New York',
    subcategory: 'Computers',
    createdAt: new Date('2026-10-01T10:00:00Z'),
    updatedAt: new Date('2026-10-01T10:00:00Z'),
  });
}

describe('ProductCreatedListener', () => {
  let listener: ProductCreatedListener;
  let indexProduct: { execute: jest.Mock };

  beforeEach(() => {
    indexProduct = { execute: jest.fn().mockResolvedValue(undefined) };
    listener = new ProductCreatedListener(indexProduct as unknown as IndexProductUseCase);
  });

  it('indexa el producto creado traducido al modelo de búsqueda', async () => {
    await listener.handle(new ProductCreatedEvent(buildEntity()));

    const [indexed] = indexProduct.execute.mock.calls[0] as [Product];
    expect(indexed).toBeInstanceOf(Product);
    expect(indexed).toMatchObject({ id: 'product-id', name: 'Gaming Laptop', category: 'Electronics' });
  });

  it('convierte el precio decimal de PostgreSQL a número', async () => {
    await listener.handle(new ProductCreatedEvent(buildEntity()));

    const [indexed] = indexProduct.execute.mock.calls[0] as [Product];
    expect(indexed.price).toBe(1299.99);
  });

  it('no propaga el error si la indexación falla', async () => {
    indexProduct.execute.mockRejectedValue(new Error('Elasticsearch down'));

    await expect(
      listener.handle(new ProductCreatedEvent(buildEntity())),
    ).resolves.toBeUndefined();
  });
});
