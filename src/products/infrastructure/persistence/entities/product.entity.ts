import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('products')
export class ProductEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'integer' })
    stock: number;

    @Column({ type: 'varchar', length: 255 })
    category: string;

    @Column({ type: 'varchar', length: 255 })
    location: string;

    @Column({ type: 'varchar', length: 255 })
    subcategory: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}