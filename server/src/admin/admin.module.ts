import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Product } from '../entities/product.entity';
import { Merchant } from '../entities/merchant.entity';
import { Hotel } from '../entities/hotel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Merchant, Hotel])
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {} 