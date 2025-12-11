import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "src/products/domain/models/product.model";
import { ProductRepositoryPort } from "src/products/domain/ports/product.repository.port";
import { ProductEntity } from "../entities/product.entity";
import { Repository } from "typeorm";
import { ProductMapper } from "../entities/product.mapper";

@Injectable()
export class PostgresProductRepository implements ProductRepositoryPort {
    private readonly logger = new Logger(PostgresProductRepository.name)
    constructor(@InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>) { }

    async save(product: Product): Promise<Product> {
        const entity = ProductMapper.toEntity(product)
        try {
            const savedEntity = await this.productRepository.save(entity)

            this.logger.log(`Product with id: ${savedEntity.id} saved successfully`)

            return ProductMapper.toDomain(savedEntity)
        } catch (error) {
            this.logger.error(`Error saving product: "${product.name}"`, error.stack)

            throw error
        }
    }

    async findByName(name: string): Promise<Product | null> {
        const entity = await this.productRepository.findOneBy({ name })

        if (!entity) {
            return null
        }

        return ProductMapper.toDomain(entity)
    }
}