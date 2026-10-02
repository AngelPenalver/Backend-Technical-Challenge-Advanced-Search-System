import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ProductModule } from './product/product.module';
import { ProductEntity } from './product/entities/product.entity';
import { SearchModule } from './search/search.module';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [ProductEntity],
    synchronize: true,
  }),
  EventEmitterModule.forRoot(),
    ProductModule,
    SearchModule,
  ],
})
export class AppModule { }
