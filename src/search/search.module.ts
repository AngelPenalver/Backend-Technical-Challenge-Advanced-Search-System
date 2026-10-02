import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { CacheModule } from "@nestjs/cache-manager";
import { SearchController } from "./infrastructure/controllers/search.controller";
import { ElasticProductAdapter } from "./infrastructure/search/elastic-product.adapter";
import { ProductCreatedListener } from "./infrastructure/listeners/product-created.listener";
import { SearchServicePort } from "./domain/ports/search-service.port";
import { SearchProductsUseCase } from "./application/use-cases/search-products.use-case";
import { AutocompleteProductUseCase } from "./application/use-cases/autocomplete-product.use-case";
import { IndexProductUseCase } from "./application/use-cases/index-product.use-case";

@Module({
    imports: [
        ElasticsearchModule.register({
            node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
        }),
        CacheModule.register({
            ttl: 60 * 60 * 24,
            max: 1000,
        }),
    ],
    controllers: [SearchController],
    providers: [
        SearchProductsUseCase,
        AutocompleteProductUseCase,
        IndexProductUseCase,
        ProductCreatedListener,
        {
            provide: SearchServicePort,
            useClass: ElasticProductAdapter,
        },
    ],
})
export class SearchModule { }
