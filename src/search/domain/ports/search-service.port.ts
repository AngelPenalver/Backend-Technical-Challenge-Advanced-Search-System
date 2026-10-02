import { Product } from "../models/product.model";
import { Autocomplete } from "../value-objects/autocomplete.vo";
import { SearchQuery } from "../value-objects/search-query.vo";

export abstract class SearchServicePort {
    abstract searchProducts(query: SearchQuery): Promise<Product[]>;
    abstract indexProduct(product: Product): Promise<void>;
    abstract autocomplete(text: Autocomplete): Promise<string[]>;
}               