/**
 * Manual test script for TripsRepository
 * Run with: npx ts-node src/modules/trips/test-repository.ts
 */

import { DataSource } from 'typeorm';
import { Trip } from './entities/trip.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';
import { Flight } from '../itinerary/entities/flight.entity';
import { Transport } from '../itinerary/entities/transport.entity';
import { Accommodation } from '../itinerary/entities/accommodation.entity';
import { LocationCache } from '../maps/entities/location-cache.entity';
import { TripsRepository } from './trips.repository';
import { v4 as uuidv4 } from 'uuid';

async function testRepository() {
  console.log('🚀 Testing TripsRepository...\n');

  // Initialize database connection
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: './database/trip-organizer.db',
    entities: [Trip, ItineraryItem, Flight, Transport, Accommodation, LocationCache],
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();
  console.log('✓ Database connection established\n');

  const tripRepository = dataSource.getRepository(Trip);
  const repository = new TripsRepository(tripRepository);

  try {
    // Test 1: Create a trip
    console.log('Test 1: Create a new trip');
    const tripId = uuidv4();
    const newTrip = await repository.create({
      id: tripId,
      title: 'Test Trip - Summer Vacation 2025',
      description: 'A wonderful trip to Europe',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-15'),
    });
    console.log('✓ Created trip:', {
      id: newTrip.id,
      title: newTrip.title,
      createdAt: newTrip.createdAt,
    });
    console.log('');

    // Test 2: Find by ID
    console.log('Test 2: Find trip by ID');
    const foundTrip = await repository.findById(tripId);
    if (foundTrip) {
      console.log('✓ Found trip:', {
        id: foundTrip.id,
        title: foundTrip.title,
        description: foundTrip.description,
      });
    } else {
      console.log('✗ Trip not found');
    }
    console.log('');

    // Test 3: Find all trips
    console.log('Test 3: Find all trips');
    const allTrips = await repository.findAll();
    console.log(`✓ Found ${allTrips.length} trip(s)`);
    allTrips.forEach((trip, index) => {
      console.log(`  ${index + 1}. ${trip.title} (${trip.id})`);
    });
    console.log('');

    // Test 4: Update trip
    console.log('Test 4: Update trip');
    const updatedTrip = await repository.update(tripId, {
      title: 'Updated Title - European Adventure',
      description: 'An amazing journey through Europe',
    });
    if (updatedTrip) {
      console.log('✓ Updated trip:', {
        id: updatedTrip.id,
        title: updatedTrip.title,
        description: updatedTrip.description,
      });
    }
    console.log('');

    // Test 5: Count trips
    console.log('Test 5: Count trips');
    const count = await repository.count();
    console.log(`✓ Total trips: ${count}`);
    console.log('');

    // Test 6: Check if trip exists
    console.log('Test 6: Check if trip exists');
    const exists = await repository.exists(tripId);
    console.log(`✓ Trip ${tripId} exists: ${exists}`);
    const notExists = await repository.exists('non-existent-id');
    console.log(`✓ Trip 'non-existent-id' exists: ${notExists}`);
    console.log('');

    // Test 7: Delete trip
    console.log('Test 7: Delete trip');
    const deleted = await repository.delete(tripId);
    console.log(`✓ Trip deleted: ${deleted}`);
    
    const stillExists = await repository.exists(tripId);
    console.log(`✓ Trip still exists after deletion: ${stillExists}`);
    console.log('');

    console.log('✅ All tests passed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await dataSource.destroy();
    console.log('✓ Database connection closed');
  }
}

// Run the tests
testRepository();
