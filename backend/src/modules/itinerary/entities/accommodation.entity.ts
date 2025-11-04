import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ItineraryItem } from './itinerary-item.entity';
import { Location } from '../types/location.interface';

@Entity('accommodations')
export class Accommodation {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 36, name: 'itinerary_item_id', unique: true })
  itineraryItemId!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text', { name: 'location' })
  locationJson!: string;

  @Column('varchar', { length: 100, nullable: true, name: 'confirmation_number' })
  confirmationNumber?: string;

  @Column('varchar', { length: 50, nullable: true, name: 'phone_number' })
  phoneNumber?: string;

  @Column('integer')
  duration!: number;

  @OneToOne(() => ItineraryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itinerary_item_id' })
  itineraryItem!: ItineraryItem;

  // Virtual property for easier access to JSON column
  get location(): Location {
    return JSON.parse(this.locationJson);
  }

  set location(location: Location) {
    this.locationJson = JSON.stringify(location);
  }

  /**
   * Custom JSON serialization to include parsed location object
   */
  toJSON() {
    return {
      id: this.id,
      itineraryItemId: this.itineraryItemId,
      name: this.name,
      location: this.location,
      confirmationNumber: this.confirmationNumber,
      phoneNumber: this.phoneNumber,
      duration: this.duration,
    };
  }
}
