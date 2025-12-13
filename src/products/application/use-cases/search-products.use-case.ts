import { Injectable, Logger } from "@nestjs/common";
import { Product } from "../../domain/models/product.model";
import { SearchServicePort } from "../../domain/ports/search-service.port";
import { SearchQuery } from "../../domain/value-objects/search-query.vo";
import { SearchProductDto } from "../dtos/query-product.dto";
import type { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject } from "@nestjs/common";

@Injectable()
export class SearchProductsUseCase {
    private readonly logger = new Logger(SearchProductsUseCase.name);
    constructor(private readonly searchServicePort: SearchServicePort, @Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }

    async execute(dto: SearchProductDto): Promise<Product[]> {

        const cacheKey = JSON.stringify({
            q: dto.q,
            category: dto.category,
            minPrice: dto.minPrice,
            maxPrice: dto.maxPrice,
            location: dto.location,
            subcategory: dto.subcategory,
            limit: dto.limit,
            offset: dto.offset,
            sort: dto.sort,
            order: dto.order
        })

        // Map DTO to domain value object
        const query: SearchQuery = {
            q: dto.q,
            category: dto.category,
            minPrice: dto.minPrice,
            maxPrice: dto.maxPrice,
            location: dto.location,
            subcategory: dto.subcategory,
            limit: dto.limit,
            offset: dto.offset,
            sort: dto.sort,
            order: dto.order
        };

        const cachedProducts = await this.cacheManager.get<Product[]>(cacheKey);
        if (cachedProducts) {
            this.logger.log(`Products found in cache for query: ${JSON.stringify(query)}`);
            return cachedProducts;
        }

        this.logger.log(`Products not found in cache for query: ${JSON.stringify(query)}`);
        const products = await this.searchServicePort.searchProducts(query);

        await this.cacheManager.set(cacheKey, products, 60 * 60 * 24);

        return products;
    }
}
