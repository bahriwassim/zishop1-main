import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminProductValidation, AdminMerchantValidation, AdminHotelValidation } from '@shared/schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Validation des produits
  @Post('products/validate')
  async validateProduct(@Body() validation: AdminProductValidation) {
    return this.adminService.validateProduct(validation);
  }

  @Get('products/pending')
  async getPendingProducts() {
    return this.adminService.getPendingProducts();
  }

  // Validation des commerçants
  @Post('merchants/validate')
  async validateMerchant(@Body() validation: AdminMerchantValidation) {
    return this.adminService.validateMerchant(validation);
  }

  @Get('merchants/pending')
  async getPendingMerchants() {
    return this.adminService.getPendingMerchants();
  }

  // Validation des hôtels
  @Post('hotels/validate')
  async validateHotel(@Body() validation: AdminHotelValidation) {
    return this.adminService.validateHotel(validation);
  }

  @Get('hotels/pending')
  async getPendingHotels() {
    return this.adminService.getPendingHotels();
  }
} 