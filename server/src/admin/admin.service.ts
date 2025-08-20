import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Merchant } from '../entities/merchant.entity';
import { Hotel } from '../entities/hotel.entity';
import { AdminProductValidation, AdminMerchantValidation, AdminHotelValidation } from '@shared/schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
  ) {}

  // Validation des produits
  async validateProduct(validation: AdminProductValidation): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: validation.productId }
    });

    if (!product) {
      throw new Error('Produit non trouvé');
    }

    product.status = validation.status;
    if (validation.status === 'rejected' && validation.rejectionReason) {
      product.rejectionReason = validation.rejectionReason;
    }

    return this.productRepository.save(product);
  }

  async getPendingProducts(): Promise<Product[]> {
    return this.productRepository.find({
      where: { status: 'pending' },
      relations: ['merchant']
    });
  }

  // Validation des commerçants
  async validateMerchant(validation: AdminMerchantValidation): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: validation.merchantId }
    });

    if (!merchant) {
      throw new Error('Commerçant non trouvé');
    }

    merchant.status = validation.status;
    if (validation.status === 'rejected' && validation.rejectionReason) {
      merchant.rejectionReason = validation.rejectionReason;
    }

    return this.merchantRepository.save(merchant);
  }

  async getPendingMerchants(): Promise<Merchant[]> {
    return this.merchantRepository.find({
      where: { status: 'pending' },
      relations: ['products', 'hotel']
    });
  }

  // Validation des hôtels
  async validateHotel(validation: AdminHotelValidation): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id: validation.hotelId }
    });

    if (!hotel) {
      throw new Error('Hôtel non trouvé');
    }

    hotel.status = validation.status;
    if (validation.status === 'rejected' && validation.rejectionReason) {
      hotel.rejectionReason = validation.rejectionReason;
    }

    return this.hotelRepository.save(hotel);
  }

  async getPendingHotels(): Promise<Hotel[]> {
    return this.hotelRepository.find({
      where: { status: 'pending' },
      relations: ['merchants', 'merchants.products']
    });
  }
} 