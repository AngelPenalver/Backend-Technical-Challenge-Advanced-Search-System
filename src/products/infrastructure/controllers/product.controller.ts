import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CreateProductDto } from "../../application/dtos/create-product.dto";
import { SearchProductDto } from "../../application/dtos/query-product.dto";
import { CreateProductUseCase } from "../../application/use-cases/create-product.use-case";
import { SearchProductsUseCase } from "../../application/use-cases/search-products.use-case";

@Controller('products')
export class ProductController {
    constructor(private readonly createProductUseCase: CreateProductUseCase, private readonly searchProductsUseCase: SearchProductsUseCase) { }

    @Post()
    async create(@Body() product: CreateProductDto) {
        return this.createProductUseCase.execute(product)
    }

    @Get('search')
    async search(@Query() query: SearchProductDto) {
        return this.searchProductsUseCase.execute(query)
    }
}


