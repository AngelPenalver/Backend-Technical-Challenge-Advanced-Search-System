import { Product } from "../models/product.model";

export abstract class SearchServicePort {
    abstract indexProduct(product: Product): Promise<void>;
}