import { ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { ProductService } from './product.service';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { PRODUCT_CREATED, ProductCreatedEvent } from './events/product-created.event';

const dto: CreateProductDto = {
  name: 'Gaming Laptop',
  description: 'Powerful laptop',
  price: 1299.99,
  stock: 50,
  category: 'Electronics',
  location: 'New York',
  subcategory: 'Computers',
};

describe('ProductService', () => {
  let service: ProductService;
  let repository: {
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
  };
  let eventEmitter: { emit: jest.Mock };

  beforeEach(() => {
    repository = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn((data: Partial<ProductEntity>) => ({ ...data })),
      save: jest.fn((product: ProductEntity) => Promise.resolve(product)),
      count: jest.fn(),
    };
    eventEmitter = { emit: jest.fn() };

    service = new ProductService(
      repository as unknown as Repository<ProductEntity>,
      eventEmitter as unknown as EventEmitter2,
    );
  });

  it('guarda el producto con un id nuevo y luego emite product.created', async () => {
    const product = await service.create(dto);

    expect(product).toMatchObject(dto);
    expect(product.id).toEqual(expect.any(String));
    expect(repository.save).toHaveBeenCalledWith(product);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      PRODUCT_CREATED,
      new ProductCreatedEvent(product),
    );
    expect(repository.save.mock.invocationCallOrder[0]).toBeLessThan(
      eventEmitter.emit.mock.invocationCallOrder[0],
    );
  });

  it('rechaza un nombre duplicado con 409 sin guardar ni emitir', async () => {
    repository.findOneBy.mockResolvedValue({ id: 'existing' });

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('no emite el evento si falla el guardado en PostgreSQL', async () => {
    repository.save.mockRejectedValue(new Error('Database down'));

    await expect(service.create(dto)).rejects.toThrow('Database down');
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });
});
