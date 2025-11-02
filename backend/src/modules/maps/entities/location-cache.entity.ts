import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('location_cache')
export class LocationCache {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 500, unique: true })
  address!: string;

  @Column('varchar', { length: 500, nullable: true, name: 'formatted_address' })
  formattedAddress?: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude!: number;

  @Column('varchar', { length: 100, nullable: true })
  city?: string;

  @Column('varchar', { length: 100, nullable: true })
  country?: string;

  @Column('varchar', { length: 255, nullable: true, name: 'place_id' })
  placeId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
