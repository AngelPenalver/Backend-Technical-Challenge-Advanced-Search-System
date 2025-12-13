import { Product } from "../../../domain/models/product.model";
import { ProductEntity } from "./product.entity";

export class ProductMapper {
    static toDomain(entity: ProductEntity): Product {
        return new Product(
            entity.id,
            entity.name,
            entity.description,
            Number(entity.price),
            entity.stock,
            entity.location,
            entity.category,
            entity.subcategory,
            entity.createdAt,
            entity.updatedAt
        );
    }

    static toEntity(domain: Product): ProductEntity {
        const entity = new ProductEntity();
        entity.id = domain.id;
        entity.name = domain.name;
        entity.description = domain.description;
        entity.price = domain.price;
        entity.stock = domain.stock;
        entity.location = domain.location;
        entity.category = domain.category;
        entity.subcategory = domain.subcategory;
        return entity;
    }
}