import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { Product } from "../../domain/models/product.model";
import { ProductRepositoryPort } from "../../domain/ports/product.repository.port";
import { SearchServicePort } from "../../domain/ports/search-service.port";
import { CreateProductDto } from "../dtos/create-product.dto";

@Injectable()
export class CreateProductUseCase {
    private readonly logger = new Logger(CreateProductUseCase.name);

    constructor(
        private readonly productRepository: ProductRepositoryPort,
        private readonly searchService: SearchServicePort
    ) { }

    async execute(product: CreateProductDto): Promise<Product> {
        this.logger.log(`Creating product: ${product.name}`);

        const existingProduct = await this.productRepository.findByName(product.name);

        if (existingProduct) {
            this.logger.warn(`Product with name: ${product.name}, already exists`);
            throw new ConflictException(`Product with name: ${product.name}, already exists`);
        }

        this.logger.log(`Product with name: ${product.name}, does not exist`);

        const newProduct = new Product(
            uuid(),
            product.name,
            product.description,
            product.price,
            product.stock,
            product.location,
            product.category,
            product.subcategory,
            new Date(),
            new Date(),
        );

        // Index in Elasticsearch FIRST to ensure consistency
        // If indexing fails, we don't want to create orphaned records in PostgreSQL
        try {
            await this.searchService.indexProduct(newProduct);
            this.logger.log(`Product with name: ${product.name}, indexed in Elasticsearch successfully`);
        } catch (error) {
            this.logger.error(`Failed to index product ${product.name} in Elasticsearch`, error.stack);
            throw new Error(`Failed to index product in search engine: ${error.message}`);
        }

        // Only save to PostgreSQL if Elasticsearch indexing succeeded
        await this.productRepository.save(newProduct);
        this.logger.log(`Product with name: ${product.name}, created in database successfully`);

        return newProduct;
    }
}