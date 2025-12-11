import { Body, Controller, Post } from "@nestjs/common";
import { CreateProductDto } from "src/products/application/dtos/create-product.dto";
import { CreateProductUseCase } from "src/products/application/use-cases/create-product.use-case";

@Controller('products')
export class ProductController {
    constructor(private readonly createProductUseCase: CreateProductUseCase) { }

    @Post()
    async create(@Body() product: CreateProductDto) {
        return this.createProductUseCase.execute(product)
    }
}
