import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
    @ApiProperty({ example: 'Gaming Laptop', description: 'Product name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Powerful laptop for gaming and video editing', description: 'Product description' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 1299.99, description: 'Product price' })
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({ example: 50, description: 'Available stock quantity' })
    @IsNumber()
    @IsPositive()
    stock: number;

    @ApiProperty({ example: 'Electronics', description: 'Product category' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ example: 'New York', description: 'Product location' })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({ example: 'Computers', description: 'Product subcategory' })
    @IsString()
    @IsNotEmpty()
    subcategory: string;
}