import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ItineraryItem } from '../../itinerary/entities/itinerary-item.entity';

@Entity('trips')
export class Trip {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('datetime', { nullable: true, name: 'start_date' })
  startDate?: Date;

  @Column('datetime', { nullable: true, name: 'end_date' })
  endDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => ItineraryItem, (item) => item.trip, { cascade: true })
  itineraryItems!: ItineraryItem[];
}
