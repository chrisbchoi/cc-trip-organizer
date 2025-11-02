import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ItineraryItem } from './itinerary-item.entity';
import { Location } from '../types/location.interface';

@Entity('flights')
export class Flight {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 36, name: 'itinerary_item_id', unique: true })
  itineraryItemId!: string;

  @Column('text', { name: 'departure_location' })
  departureLocationJson!: string;

  @Column('text', { name: 'arrival_location' })
  arrivalLocationJson!: string;

  @Column('varchar', { length: 50, nullable: true, name: 'flight_number' })
  flightNumber?: string;

  @Column('varchar', { length: 100, nullable: true })
  airline?: string;

  @Column('varchar', { length: 50, nullable: true, name: 'confirmation_code' })
  confirmationCode?: string;

  @Column('integer')
  duration!: number;

  @OneToOne(() => ItineraryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itinerary_item_id' })
  itineraryItem!: ItineraryItem;

  // Virtual properties for easier access to JSON columns
  get departureLocation(): Location {
    return JSON.parse(this.departureLocationJson);
  }

  set departureLocation(location: Location) {
    this.departureLocationJson = JSON.stringify(location);
  }

  get arrivalLocation(): Location {
    return JSON.parse(this.arrivalLocationJson);
  }

  set arrivalLocation(location: Location) {
    this.arrivalLocationJson = JSON.stringify(location);
  }
}
