import { Product } from "../../domain/models/product.model";
import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { CreateProductDto } from "../dtos/create-product.dto";
import { v4 as uuid } from "uuid";
import { ProductRepositoryPort } from "../../domain/ports/product.repository.port";
import { SearchServicePort } from "../../domain/ports/search-service.port";

@Injectable()
export class CreateProductUseCase {
    private readonly logger = new Logger(CreateProductUseCase.name)
    constructor(private readonly productRepository: ProductRepositoryPort, private readonly searchService: SearchServicePort) { }

    async execute(product: CreateProductDto): Promise<Product> {
        this.logger.log(`Creating product: ${product.name}`)


        const existingProduct = await this.productRepository.findByName(product.name);

        if (existingProduct) {
            this.logger.warn(`Product with name: ${product.name}, already exists`)
            throw new ConflictException(`Product with name: ${product.name}, already exists`);
        }

        this.logger.log(`Product with name: ${product.name}, does not exist`)

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
        this.logger.log(`Product with name: ${product.name}, created successfully`)


        this.searchService.indexProduct(newProduct);
        this.logger.log(`Product with name: ${product.name}, indexed successfully`)

        return newProduct;
    }
}