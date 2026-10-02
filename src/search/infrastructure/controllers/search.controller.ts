import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SearchProductDto } from "../../application/dtos/query-product.dto";
import { AutocompleteProductDto } from "../../application/dtos/autocomplete-product.dto";
import { SearchProductsUseCase } from "../../application/use-cases/search-products.use-case";
import { AutocompleteProductUseCase } from "../../application/use-cases/autocomplete-product.use-case";

@ApiTags('search')
@Controller('products')
export class SearchController {
    constructor(
        private readonly searchProductsUseCase: SearchProductsUseCase,
        private readonly autocompleteProductUseCase: AutocompleteProductUseCase,
    ) { }

    /** Busca productos con texto, filtros, orden y paginación. */
    @Get('search')
    @ApiOperation({ summary: 'Search products', description: 'Advanced product search with filters, sorting, and pagination. Uses Elasticsearch for full-text search and caches results in memory.' })
    @ApiResponse({ status: 200, description: 'List of products matching the search criteria' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters' })
    search(@Query() query: SearchProductDto) {
        return this.searchProductsUseCase.execute(query);
    }

    /** Sugiere nombres de producto a partir de un texto parcial. */
    @Get('autocomplete')
    @ApiOperation({ summary: 'Autocomplete product names', description: 'Get autocomplete suggestions for product names based on partial text input. Results are cached in memory.' })
    @ApiResponse({ status: 200, description: 'List of product name suggestions' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters' })
    autocomplete(@Query() query: AutocompleteProductDto) {
        return this.autocompleteProductUseCase.execute(query);
    }
}
