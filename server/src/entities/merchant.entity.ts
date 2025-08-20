import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Hotel } from './hotel.entity';
import { Product } from './product.entity';

export type MerchantStatus = 'pending' | 'approved' | 'rejected';

@Entity()
export class Merchant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @ManyToOne(() => Hotel, hotel => hotel.merchants)
  hotel: Hotel;

  @OneToMany(() => Product, product => product.merchant)
  products: Product[];

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  status: MerchantStatus;

  @Column({ nullable: true })
  rejectionReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 