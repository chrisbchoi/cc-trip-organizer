import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Trip } from '../trips/entities/trip.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';
import { Flight } from '../itinerary/entities/flight.entity';
import { Transport } from '../itinerary/entities/transport.entity';
import { Accommodation } from '../itinerary/entities/accommodation.entity';
import { LocationCache } from '../maps/entities/location-cache.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DATABASE_PATH || './database/trip-organizer.db',
  entities: [Trip, ItineraryItem, Flight, Transport, Accommodation, LocationCache],
  migrations: ['dist/modules/database/migrations/*.js'], // Use compiled JS files
  synchronize: false, // Use migrations instead
  logging: process.env.NODE_ENV === 'development',
});

// Initialize the data source
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
