import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { CreateProductUseCase } from "./application/use-cases/create-product.use-case";
import { ProductController } from "./infrastructure/controllers/product.controller";
import { PostgresProductRepository } from "./infrastructure/persistence/repositories/postgres-product.repository";
import { ProductEntity } from "./infrastructure/persistence/entities/product.entity";
import { ProductRepositoryPort } from "./domain/ports/product.repository.port";
import { SearchServicePort } from "./domain/ports/search-service.port";
import { ElasticProductAdapter } from "./infrastructure/search/elastic-product.adapter";
import { ProductSeederService } from "./infrastructure/seeder/product.seeder.service";
import { SearchProductsUseCase } from "./application/use-cases/search-products.use-case";

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductEntity]),
        ElasticsearchModule.register({
            node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
        }),
    ],
    controllers: [ProductController],
    providers: [
        CreateProductUseCase,
        {
            provide: ProductRepositoryPort,
            useClass: PostgresProductRepository
        },
        {
            provide: SearchServicePort,
            useClass: ElasticProductAdapter
        },
        ProductSeederService,
        SearchProductsUseCase
    ],
    exports: [],
})

export class ProductsModule { }