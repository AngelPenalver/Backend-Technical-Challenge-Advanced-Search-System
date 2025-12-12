import { Injectable } from "@nestjs/common";
import { Product } from "../../domain/models/product.model";
import { SearchServicePort } from "../../domain/ports/search-service.port";
import { SearchQuery } from "../../domain/value-objects/search-query.vo";
import { SearchProductDto } from "../dtos/query-product.dto";

@Injectable()
export class SearchProductsUseCase {
    constructor(private readonly searchServicePort: SearchServicePort) { }

    async execute(dto: SearchProductDto): Promise<Product[]> {
        // Map DTO to domain value object
        const query: SearchQuery = {
            q: dto.q,
            category: dto.category,
            minPrice: dto.minPrice,
            maxPrice: dto.maxPrice,
            limit: dto.limit,
            offset: dto.offset,
        };

        return this.searchServicePort.searchProducts(query);
    }
}
