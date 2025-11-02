import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from '../trips/entities/trip.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';
import { Flight } from '../itinerary/entities/flight.entity';
import { Transport } from '../itinerary/entities/transport.entity';
import { Accommodation } from '../itinerary/entities/accommodation.entity';
import { LocationCache } from '../maps/entities/location-cache.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH || './database/trip-organizer.db',
      entities: [Trip, ItineraryItem, Flight, Transport, Accommodation, LocationCache],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Trip, ItineraryItem, Flight, Transport, Accommodation, LocationCache]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
