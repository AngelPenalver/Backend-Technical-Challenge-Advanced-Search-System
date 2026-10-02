import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { ProductEntity } from "./entities/product.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { PRODUCT_CREATED, ProductCreatedEvent } from "./events/product-created.event";

/** Gestiona los productos en PostgreSQL, la fuente de verdad. */
@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name);

    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    /** Guarda el producto y emite `product.created` para que se indexe en la búsqueda. */
    async create(dto: CreateProductDto): Promise<ProductEntity> {
        const existing = await this.productRepository.findOneBy({ name: dto.name });
        if (existing) {
            throw new ConflictException(`Product with name: ${dto.name}, already exists`);
        }

        const product = await this.productRepository.save(
            this.productRepository.create({ id: randomUUID(), ...dto }),
        );
        this.logger.log(`Product ${product.id} created`);

        this.eventEmitter.emit(PRODUCT_CREATED, new ProductCreatedEvent(product));
        return product;
    }

    /** Cuenta los productos guardados. */
    count(): Promise<number> {
        return this.productRepository.count();
    }
}
