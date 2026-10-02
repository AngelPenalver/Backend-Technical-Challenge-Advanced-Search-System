import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PRODUCT_CREATED, ProductCreatedEvent } from "src/product/events/product-created.event";
import { IndexProductUseCase } from "../../application/use-cases/index-product.use-case";
import { Product } from "../../domain/models/product.model";

/** Indexa en la búsqueda cada producto creado en el módulo de productos. */
@Injectable()
export class ProductCreatedListener {
    private readonly logger = new Logger(ProductCreatedListener.name);

    constructor(private readonly indexProductUseCase: IndexProductUseCase) { }

    /** Traduce el evento al modelo de búsqueda e indexa; si falla, el producto queda sin indexar. */
    @OnEvent(PRODUCT_CREATED, { async: true })
    async handle({ product }: ProductCreatedEvent): Promise<void> {
        try {
            await this.indexProductUseCase.execute(
                new Product(
                    product.id,
                    product.name,
                    product.description,
                    Number(product.price),
                    product.stock,
                    product.location,
                    product.category,
                    product.subcategory,
                    product.createdAt,
                    product.updatedAt,
                ),
            );
        } catch (error) {
            this.logger.error(
                `Failed to index product ${product.id}`,
                error instanceof Error ? error.stack : error,
            );
        }
    }
}
