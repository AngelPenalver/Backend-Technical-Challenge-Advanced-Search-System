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
            product.category,
            new Date(),
            new Date(),
        );

        await this.productRepository.save(newProduct);
        this.logger.log(`Product with name: ${product.name}, created successfully`);

        try {
            await this.searchService.indexProduct(newProduct);
            this.logger.log(`Product with name: ${product.name}, indexed successfully`);
        } catch (error) {
            this.logger.error(`Failed to index product ${product.name}, but product was created`, error.stack);
            // Don't throw - product was created successfully, indexing is secondary
        }

        return newProduct;
    }
}