import { Product } from "../models/product.model";

export interface ProductRepositoryPort {
    save(product: Product): Promise<Product>;
}