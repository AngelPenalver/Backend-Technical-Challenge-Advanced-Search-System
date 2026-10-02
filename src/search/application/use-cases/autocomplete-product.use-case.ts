import { Injectable } from "@nestjs/common";
import { SearchServicePort } from "../../domain/ports/search-service.port";
import { AutocompleteProductDto } from "../dtos/autocomplete-product.dto";
import { Logger } from "@nestjs/common";
import type { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject } from "@nestjs/common";

@Injectable()
export class AutocompleteProductUseCase {
    private readonly logger = new Logger(AutocompleteProductUseCase.name);
    constructor(private readonly searchServicePort: SearchServicePort, @Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }

    async execute({ text }: AutocompleteProductDto): Promise<string[]> {
        const cachedProducts = await this.cacheManager.get<string[]>(text);
        if (cachedProducts) {
            this.logger.log(`Products found in cache for query: ${JSON.stringify(text)}`);
            return cachedProducts;
        }

        this.logger.log(`Products not found in cache for query: ${JSON.stringify(text)}`);
        const products = await this.searchServicePort.autocomplete({ text });

        await this.cacheManager.set<string[]>(text, products);

        return products;
    }
}