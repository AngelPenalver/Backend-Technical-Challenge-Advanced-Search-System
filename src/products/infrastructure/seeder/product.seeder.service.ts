import { faker } from "@faker-js/faker";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { CreateProductUseCase } from "src/products/application/use-cases/create-product.use-case";
import { Product } from "src/products/domain/models/product.model";
import { ProductRepositoryPort } from "src/products/domain/ports/product.repository.port";

@Injectable()
export class ProductSeederService implements OnModuleInit {
    private logger = new Logger(ProductSeederService.name);
    constructor(private readonly createProductUseCase: CreateProductUseCase, private readonly productRepository: ProductRepositoryPort) { }

    async onModuleInit() {
        await this.seed();
    }

    async seed() {

        const product = await this.productRepository.findAll();
        if (product.length > 0) {
            this.logger.log('Products already seeded');
            return;
        }

        this.logger.log('Seeding products...')

        const promises: Promise<Product>[] = []

        for (let i = 0; i < 50; i++) {
            const product = this.createRandomProduct();

            promises.push(this.createProductUseCase.execute(product))
        }

        await Promise.all(promises)

        this.logger.log('50 products seeded successfully')
    }

    createRandomProduct() {
        return {
            name: faker.commerce.productName(),
            price: Number(faker.finance.amount({ min: 100, max: 10000 })),
            description: faker.lorem.sentence(),
            stock: faker.number.int({ min: 0, max: 100 }),
            category: faker.commerce.department(),
        }
    }
}
