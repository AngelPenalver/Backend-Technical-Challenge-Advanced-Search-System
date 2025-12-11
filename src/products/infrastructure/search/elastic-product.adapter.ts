import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { Product } from "src/products/domain/models/product.model";
import { SearchServicePort } from "src/products/domain/ports/search-service.port";

@Injectable()
export class ElasticProductAdapter implements SearchServicePort, OnModuleInit {
    private readonly logger = new Logger(ElasticProductAdapter.name);
    constructor(private readonly elasticsearchService: ElasticsearchService) { }

    async indexProduct(product: Product): Promise<void> {
        try {
            await this.elasticsearchService.index({
                index: 'products',
                id: product.id,
                body: {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    stock: product.stock,
                    category: product.category,
                }
            })
            this.logger.log('Product indexed successfully');

        } catch (error) {
            this.logger.error('Error while indexing product:', error.stack);
            throw error;
        }
    }

    async onModuleInit() {
        try {

            this.logger.log('Initializing Elasticsearch index...');

            const indexExists = await this.elasticsearchService.indices.exists({ index: 'products' });

            if (!indexExists) {
                this.logger.log('Index products does not exist, creating...');
                await this.elasticsearchService.indices.create({ index: 'products' });
                this.logger.log('Index products created');
            } else {
                this.logger.log('Index products already exists');
            }


        } catch (error) {
            this.logger.error('Error while initializing Elasticsearch index:', error.stack);
        }
    }
}