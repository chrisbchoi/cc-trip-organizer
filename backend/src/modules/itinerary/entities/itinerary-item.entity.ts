import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Trip } from '../../trips/entities/trip.entity';

@Entity('itinerary_items')
export class ItineraryItem {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 36, name: 'trip_id' })
  tripId!: string;

  @Column('varchar', { length: 50 })
  type!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column('datetime', { name: 'start_date' })
  startDate!: Date;

  @Column('datetime', { name: 'end_date' })
  endDate!: Date;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('integer', { name: 'order_index', default: 0 })
  orderIndex!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Trip, (trip) => trip.itineraryItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;
}
