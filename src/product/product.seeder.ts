import { faker } from "@faker-js/faker";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { EventEmitterReadinessWatcher } from "@nestjs/event-emitter";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";

const SEED_SIZE = 50;

/** Crea productos de ejemplo la primera vez que arranca la aplicación. */
@Injectable()
export class ProductSeeder implements OnApplicationBootstrap {
    private readonly logger = new Logger(ProductSeeder.name);

    constructor(
        private readonly productService: ProductService,
        private readonly eventEmitterReadiness: EventEmitterReadinessWatcher,
    ) { }

    /** Espera a que los listeners estén registrados para que los productos se indexen. */
    async onApplicationBootstrap() {
        await this.eventEmitterReadiness.waitUntilReady();
        await this.seed();
    }

    /** Siembra productos aleatorios si la tabla está vacía. */
    async seed() {
        if ((await this.productService.count()) > 0) {
            this.logger.log('Products already seeded');
            return;
        }

        this.logger.log('Seeding products...');
        await Promise.all(
            Array.from({ length: SEED_SIZE }, () => this.productService.create(randomProduct())),
        );
        this.logger.log(`${SEED_SIZE} products seeded successfully`);
    }
}

/** Genera los datos de un producto aleatorio. */
function randomProduct(): CreateProductDto {
    return {
        name: faker.commerce.productName(),
        price: Number(faker.finance.amount({ min: 100, max: 10000 })),
        description: faker.lorem.sentence(),
        stock: faker.number.int({ min: 0, max: 100 }),
        location: faker.location.city(),
        category: faker.commerce.department(),
        subcategory: faker.commerce.department(),
    };
}
