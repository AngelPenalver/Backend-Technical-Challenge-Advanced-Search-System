import { ProductEntity } from "../entities/product.entity";

export const PRODUCT_CREATED = 'product.created';

/** Evento emitido después de guardar un producto en PostgreSQL. */
export class ProductCreatedEvent {
    constructor(public readonly product: ProductEntity) { }
}
