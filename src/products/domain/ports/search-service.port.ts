import { Product } from "../models/product.model";

export interface SearchServicePort {
    search(query: string): Promise<Product[]>;
    indexProduct(product: Product): Promise<void>;
}