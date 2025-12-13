import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateProductDto } from "../../application/dtos/create-product.dto";
import { SearchProductDto } from "../../application/dtos/query-product.dto";
import { CreateProductUseCase } from "../../application/use-cases/create-product.use-case";
import { SearchProductsUseCase } from "../../application/use-cases/search-products.use-case";
import { AutocompleteProductUseCase } from "../../application/use-cases/autocomplete-product.use-case";
import { AutocompleteProductDto } from "src/products/application/dtos/autocomplete-product.dto";

@ApiTags('products')
@Controller('products')
export class ProductController {
    constructor(private readonly createProductUseCase: CreateProductUseCase, private readonly searchProductsUseCase: SearchProductsUseCase, private readonly autocompleteProductUseCase: AutocompleteProductUseCase) { }

    @Post()
    @ApiOperation({ summary: 'Create a new product', description: 'Creates a new product and indexes it in Elasticsearch for search' })
    @ApiResponse({ status: 201, description: 'Product successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 409, description: 'Product with this name already exists' })
    async create(@Body() product: CreateProductDto) {
        return this.createProductUseCase.execute(product)
    }

    @Get('search')
    @ApiOperation({ summary: 'Search products', description: 'Advanced product search with filters, sorting, and pagination. Uses Elasticsearch for fast full-text search and Redis for caching.' })
    @ApiResponse({ status: 200, description: 'List of products matching the search criteria' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters' })
    async search(@Query() query: SearchProductDto) {
        return this.searchProductsUseCase.execute(query)
    }

    @Get('autocomplete')
    @ApiOperation({ summary: 'Autocomplete product names', description: 'Get autocomplete suggestions for product names based on partial text input. Results are cached in Redis.' })
    @ApiResponse({ status: 200, description: 'List of product name suggestions' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters' })
    async autocomplete(@Query() query: AutocompleteProductDto) {
        return this.autocompleteProductUseCase.execute(query)
    }
}


