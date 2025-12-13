import { ElasticsearchService } from "@nestjs/elasticsearch";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Product } from "../../domain/models/product.model";
import { SearchQuery } from "../../domain/value-objects/search-query.vo";
import { SearchServicePort } from "../../domain/ports/search-service.port";
import { ELASTICSEARCH_CONSTANTS } from "./elasticsearch.constants";
import {
    AutocompleteResult,
    ElasticsearchFilterQuery,
    ElasticsearchMustQuery,
} from "./elasticsearch.types";
import { Autocomplete } from "src/products/domain/value-objects/autocomplete.vo";

@Injectable()
export class ElasticProductAdapter implements SearchServicePort, OnModuleInit {
    private readonly logger = new Logger(ElasticProductAdapter.name);

    constructor(private readonly elasticsearchService: ElasticsearchService) { }

    async autocomplete(query: Autocomplete): Promise<string[]> {
        const { text } = query;
        try {
            const response = await this.elasticsearchService.search<AutocompleteResult>({
                index: ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX,
                size: 5,
                query: {
                    "match_phrase_prefix": {
                        "name": text
                    }
                }
            });
            return response.hits.hits.map(hit => hit._source!.name);
        } catch (error) {
            this.logger.error('Error while autocomplete:', error.stack);
            throw error;
        }
    }

    async searchProducts(query: SearchQuery): Promise<Product[]> {
        try {
            const { q, category, minPrice, maxPrice, offset, limit, location, subcategory, sort, order } = query;

            const must: ElasticsearchMustQuery[] = [];
            const filters: ElasticsearchFilterQuery[] = [];

            if (q) {
                must.push({
                    multi_match: {
                        query: q,
                        fields: ['name^2', 'description'],
                        fuzziness: 'AUTO'
                    }
                });
            } else {
                must.push({ match_all: {} });
            }

            if (category) filters.push({ term: { category: category } });
            if (location) filters.push({ term: { location: location } });
            if (subcategory) filters.push({ term: { subcategory: subcategory } });

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

            let sortOption: any = ['_score'];

            if (sort) {
                if (sort === 'relevance') {
                    sortOption = ['_score'];
                } else {
                    const sortField = sort === 'name' ? 'name.keyword' : sort;
                    sortOption = [{ [sortField]: { order: order || 'asc' } }];
                }
            }

            this.logger.log('Searching products...');

            const response = await this.elasticsearchService.search<Product>({
                index: ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX,
                from: offset,
                size: limit,
                sort: sortOption,
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

    async indexProduct(product: Product): Promise<void> {
        try {
            await this.elasticsearchService.index({
                index: ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX,
                id: product.id,
                document: {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    stock: product.stock,
                    location: product.location,
                    category: product.category,
                    subcategory: product.subcategory,
                    createdAt: product.createdAt
                }
            });
            this.logger.log('Product indexed successfully');

        } catch (error) {
            this.logger.error('Error while indexing product:', error.stack);
            throw error;
        }
    }

    async onModuleInit() {
        try {
            this.logger.log('Initializing Elasticsearch index...');

            const indexExists = await this.elasticsearchService.indices.exists({
                index: ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX
            });

            if (!indexExists) {
                this.logger.log(`Index ${ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX} does not exist, creating...`);

                await this.elasticsearchService.indices.create({
                    index: ELASTICSEARCH_CONSTANTS.PRODUCT_INDEX,
                    mappings: {
                        properties: {
                            name: {
                                type: 'text',
                                analyzer: 'standard',
                                fields: {
                                    keyword: { type: 'keyword' }
                                }
                            },
                            description: { type: 'text' },
                            stock: { type: 'integer' },
                            location: { type: 'keyword' },
                            category: { type: 'keyword' },
                            subcategory: { type: 'keyword' },
                            price: { type: 'float' },
                            createdAt: { type: 'date' }
                        }
                    }
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