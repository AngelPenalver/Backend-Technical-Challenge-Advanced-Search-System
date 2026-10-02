import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "./entities/product.entity";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { ProductSeeder } from "./product.seeder";

@Module({
    imports: [TypeOrmModule.forFeature([ProductEntity])],
    controllers: [ProductController],
    providers: [ProductService, ProductSeeder],
})
export class ProductModule { }
