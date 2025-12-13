import { IsNumber, IsOptional, IsString, Min, IsPositive, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class SearchProductDto {
    @ApiPropertyOptional({ example: 'laptop', description: 'Search text in product name and description' })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({ example: 'Electronics', description: 'Filter by category' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ example: 500, description: 'Minimum price filter' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional({ example: 2000, description: 'Maximum price filter' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @ApiPropertyOptional({ example: 'New York', description: 'Filter by location' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({ example: 'Computers', description: 'Filter by subcategory' })
    @IsOptional()
    @IsString()
    subcategory?: string;

    @ApiPropertyOptional({ example: 10, description: 'Number of results per page', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    limit?: number;

    @ApiPropertyOptional({ example: 0, description: 'Number of results to skip for pagination', default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number;

    @ApiPropertyOptional({ enum: ['price', 'name', 'stock', 'createdAt', 'relevance'], description: 'Field to sort by', example: 'price' })
    @IsOptional()
    @IsEnum(['price', 'name', 'stock', 'createdAt', 'relevance'])
    sort?: 'price' | 'name' | 'stock' | 'createdAt' | 'relevance';

    @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Sort order', example: 'asc' })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    order?: 'asc' | 'desc';
}