import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ItineraryItem } from './itinerary-item.entity';

export interface Location {
  address: string;
  formattedAddress?: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  placeId?: string;
}

@Entity('accommodations')
export class Accommodation {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 36, name: 'itinerary_item_id', unique: true })
  itineraryItemId!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text')
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

  // Virtual property for easier access
  get location(): Location {
    return JSON.parse(this.locationJson);
  }

  set location(location: Location) {
    this.locationJson = JSON.stringify(location);
  }
}
