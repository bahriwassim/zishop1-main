import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Merchant } from './merchant.entity';

export type HotelStatus = 'pending' | 'approved' | 'rejected';

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  status: HotelStatus;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column()
  qrCode: string;

  @OneToMany(() => Merchant, merchant => merchant.hotel)
  merchants: Merchant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 