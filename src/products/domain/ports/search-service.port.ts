import { Product } from "../models/product.model";
import { SearchQuery } from "../value-objects/search-query.vo";

export abstract class SearchServicePort {
    abstract searchProducts(query: SearchQuery): Promise<Product[]>;
    abstract indexProduct(product: Product): Promise<void>;
}               