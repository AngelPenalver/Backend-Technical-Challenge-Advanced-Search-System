import { Injectable } from "@nestjs/common";
import { Product } from "../../domain/models/product.model";
import { SearchServicePort } from "../../domain/ports/search-service.port";

/** Indexa en el motor de búsqueda un producto ya guardado. */
@Injectable()
export class IndexProductUseCase {
    constructor(private readonly searchService: SearchServicePort) { }

    execute(product: Product): Promise<void> {
        return this.searchService.indexProduct(product);
    }
}
