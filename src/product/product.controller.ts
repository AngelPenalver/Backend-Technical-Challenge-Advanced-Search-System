import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";

@ApiTags('products')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    /** Crea un producto; se indexa en la búsqueda de forma asíncrona. */
    @Post()
    @ApiOperation({ summary: 'Create a new product', description: 'Saves the product in PostgreSQL and indexes it in Elasticsearch asynchronously' })
    @ApiResponse({ status: 201, description: 'Product successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 409, description: 'Product with this name already exists' })
    create(@Body() dto: CreateProductDto) {
        return this.productService.create(dto);
    }
}
