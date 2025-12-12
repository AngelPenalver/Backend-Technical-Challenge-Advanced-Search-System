import { ElasticsearchService } from "@nestjs/elasticsearch";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Product } from "../../domain/models/product.model";
import { SearchQuery } from "../../domain/value-objects/search-query.vo";
import { SearchServicePort } from "../../domain/ports/search-service.port";
import { ELASTICSEARCH_CONSTANTS } from "./elasticsearch.constants";
import {
    ElasticsearchFilterQuery,
    ElasticsearchMustQuery,
} from "./elasticsearch.types";

@Injectable()
export class ElasticProductAdapter implements SearchServicePort, OnModuleInit {
    private readonly logger = new Logger(ElasticProductAdapter.name);

    constructor(private readonly elasticsearchService: ElasticsearchService) { }

    /**
     * Search products in Elasticsearch
     * @param query The search query
     * @returns The search results
     */
    async searchProducts(query: SearchQuery): Promise<Product[]> {
        try {
            const { q, category, minPrice, maxPrice, offset, limit } = query;

            const must: ElasticsearchMustQuery[] = [];
            const filters: ElasticsearchFilterQuery[] = [];

            /**
             * If a query is provided, add it to the must clause
             * Otherwise, add a match_all query to the must clause
             */
            if (q) {
                must.push({
                    multi_match: {
                        query: q,
                        fields: ['name^2', 'description'],
                        fuzziness: 'AUTO'
                    }
                });
            } else {
                must.push({
                    match_all: {}
                });
            }

            /**
             * If a category is provided, add it to the filter clause
             */
            if (category) {
                filters.push({
                    term: {
                        category: category
                    }
                });
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                filters.push({
                    range: {
                        price: {
                            ...(minPrice !== undefined && { gte: minPrice }),
                            ...(maxPrice !== undefined && { lte: maxPrice }),
                        }
                    }
                });
            }

            this.logger.log('Searching products...');
            const response = await this.elasticsearchService.search<Product>({
                index: ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX,
                from: offset,
                size: limit,
                query: {
                    bool: {
                        must,
                        filter: filters
                    }
                }
            });

            this.logger.log(`Products searched by: ${JSON.stringify(query)}`);

            return response.hits.hits.map(hit => hit._source as Product);

        } catch (error) {
            this.logger.error('Error while searching products:', error.stack);
            throw error;
        }
    }



    /**
     * Index a product in Elasticsearch
     * @param product The product to index
     */
    async indexProduct(product: Product): Promise<void> {
        try {
            await this.elasticsearchService.index({
                index: ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX,
                id: product.id,
                body: {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    stock: product.stock,
                    category: product.category,
                }
            });
            this.logger.log('Product indexed successfully');

        } catch (error) {
            this.logger.error('Error while indexing product:', error.stack);
            throw error;
        }
    }


    /**
     * Initialize the Elasticsearch index if it doesn't exist
     */
    async onModuleInit() {
        try {

            this.logger.log('Initializing Elasticsearch index...');

            const indexExists = await this.elasticsearchService.indices.exists({
                index: ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX
            });

            if (!indexExists) {
                this.logger.log(`Index ${ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX} does not exist, creating...`);
                await this.elasticsearchService.indices.create({
                    index: ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX
                });
                this.logger.log(`Index ${ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX} created`);
            } else {
                this.logger.log(`Index ${ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX} already exists`);
            }


        } catch (error) {
            this.logger.error('Error while initializing Elasticsearch index:', error.stack);
        }
    }
}