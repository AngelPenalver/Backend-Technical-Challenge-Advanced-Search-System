import { Product } from "../models/product.model";

export abstract class ProductRepositoryPort {
    abstract save(product: Product): Promise<Product>;
    abstract findByName(name: string): Promise<Product | null>;
}