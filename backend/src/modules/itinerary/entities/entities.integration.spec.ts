import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Trip } from '../../trips/entities/trip.entity';
import {
  ItineraryItem,
  Flight,
  Transport,
  Accommodation,
} from './index';
import { Location } from '../types/location.interface';

describe('Itinerary Entities Integration Tests', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [Trip, ItineraryItem, Flight, Transport, Accommodation],
      synchronize: true,
      logging: false,
    });

    await dataSource.initialize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  afterEach(async () => {
    // Clean up all tables
    await dataSource.getRepository(Flight).clear();
    await dataSource.getRepository(Transport).clear();
    await dataSource.getRepository(Accommodation).clear();
    await dataSource.getRepository(ItineraryItem).clear();
    await dataSource.getRepository(Trip).clear();
  });

  describe('ItineraryItem Entity', () => {
    it('should create an itinerary item with all required fields', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);

      // Create a trip first
      const trip = tripRepo.create({
        id: uuidv4(),
        title: 'Test Trip',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-10'),
      });
      await tripRepo.save(trip);

      // Create itinerary item
      const item = itemRepo.create({
        id: uuidv4(),
        tripId: trip.id,
        type: 'flight',
        title: 'Flight to Paris',
        startDate: new Date('2025-12-01T10:00:00Z'),
        endDate: new Date('2025-12-01T12:00:00Z'),
        notes: 'Check in 2 hours early',
        orderIndex: 0,
      });

      const saved = await itemRepo.save(item);

      expect(saved.id).toBe(item.id);
      expect(saved.title).toBe('Flight to Paris');
      expect(saved.type).toBe('flight');
      expect(saved.tripId).toBe(trip.id);
      expect(saved.notes).toBe('Check in 2 hours early');
      expect(saved.orderIndex).toBe(0);
    });

    it('should load itinerary item with trip relationship', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);

      const trip = tripRepo.create({
        id: uuidv4(),
        title: 'Europe Tour',
      });
      await tripRepo.save(trip);

      const item = itemRepo.create({
        id: uuidv4(),
        tripId: trip.id,
        type: 'accommodation',
        title: 'Hotel Paris',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-03'),
        orderIndex: 0,
      });
      await itemRepo.save(item);

      // Load with relation
      const loaded = await itemRepo.findOne({
        where: { id: item.id },
        relations: ['trip'],
      });

      expect(loaded).toBeDefined();
      expect(loaded?.trip).toBeDefined();
      expect(loaded?.trip.title).toBe('Europe Tour');
    });

    it('should cascade delete itinerary items when trip is deleted', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);

      const trip = tripRepo.create({
        id: uuidv4(),
        title: 'Delete Test',
      });
      await tripRepo.save(trip);

      const item = itemRepo.create({
        id: uuidv4(),
        tripId: trip.id,
        type: 'flight',
        title: 'Test Flight',
        startDate: new Date(),
        endDate: new Date(),
        orderIndex: 0,
      });
      await itemRepo.save(item);

      // Delete trip
      await tripRepo.remove(trip);

      // Item should be deleted
      const found = await itemRepo.findOne({ where: { id: item.id } });
      expect(found).toBeNull();
    });
  });

  describe('Flight Entity', () => {
    const createTestLocation = (): Location => ({
      address: 'Test Airport',
      formattedAddress: 'Test Airport, Test City',
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Test City',
      country: 'Test Country',
      placeId: 'test-place-id',
    });

    it('should create flight with JSON location columns', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);
      const flightRepo = dataSource.getRepository(Flight);

      // Create trip and item
      const trip = await tripRepo.save({
        id: uuidv4(),
        title: 'Flight Trip',
      });

      const item = await itemRepo.save({
        id: uuidv4(),
        tripId: trip.id,
        type: 'flight',
        title: 'Paris to London',
        startDate: new Date('2025-12-01T10:00:00Z'),
        endDate: new Date('2025-12-01T11:30:00Z'),
        orderIndex: 0,
      });

      // Create flight
      const departure = createTestLocation();
      departure.city = 'Paris';

      const arrival = createTestLocation();
      arrival.city = 'London';

      const flight = flightRepo.create({
        id: uuidv4(),
        itineraryItemId: item.id,
        flightNumber: 'AF1234',
        airline: 'Air France',
        confirmationCode: 'ABC123',
        duration: 90,
      });

      flight.departureLocation = departure;
      flight.arrivalLocation = arrival;

      const saved = await flightRepo.save(flight);

      expect(saved.flightNumber).toBe('AF1234');
      expect(saved.airline).toBe('Air France');
      expect(saved.duration).toBe(90);
      expect(saved.departureLocationJson).toBeDefined();
      expect(saved.arrivalLocationJson).toBeDefined();
    });

    it('should parse JSON columns with getters', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);
      const flightRepo = dataSource.getRepository(Flight);

      const trip = await tripRepo.save({ id: uuidv4(), title: 'Test' });
      const item = await itemRepo.save({
        id: uuidv4(),
        tripId: trip.id,
        type: 'flight',
        title: 'Test Flight',
        startDate: new Date(),
        endDate: new Date(),
        orderIndex: 0,
      });

      const location: Location = {
        address: '123 Test St',
        latitude: 48.8566,
        longitude: 2.3522,
        city: 'Paris',
      };

      const flight = flightRepo.create({
        id: uuidv4(),
        itineraryItemId: item.id,
        duration: 120,
      });

      flight.departureLocation = location;
      flight.arrivalLocation = location;

      await flightRepo.save(flight);

      // Retrieve and test getters
      const found = await flightRepo.findOne({ where: { id: flight.id } });
      expect(found).toBeDefined();
      expect(found!.departureLocation.city).toBe('Paris');
      expect(found!.arrivalLocation.latitude).toBe(48.8566);
    });

    it('should load flight with itinerary item relation', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);
      const flightRepo = dataSource.getRepository(Flight);

      const trip = await tripRepo.save({ id: uuidv4(), title: 'Test' });
      const item = await itemRepo.save({
        id: uuidv4(),
        tripId: trip.id,
        type: 'flight',
        title: 'NYC to LA',
        startDate: new Date(),
        endDate: new Date(),
        orderIndex: 0,
      });

      const location = createTestLocation();
      const flight = flightRepo.create({
        id: uuidv4(),
        itineraryItemId: item.id,
        duration: 300,
      });
      flight.departureLocation = location;
      flight.arrivalLocation = location;

      await flightRepo.save(flight);

      const found = await flightRepo.findOne({
        where: { id: flight.id },
        relations: ['itineraryItem'],
      });

      expect(found).toBeDefined();
      expect(found!.itineraryItem).toBeDefined();
      expect(found!.itineraryItem.title).toBe('NYC to LA');
    });
  });

  describe('Transport Entity', () => {
    const createTestLocation = (): Location => ({
      address: 'Test Station',
      latitude: 48.8566,
      longitude: 2.3522,
    });

    it('should create transport with all fields', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);
      const transportRepo = dataSource.getRepository(Transport);

      const trip = await tripRepo.save({ id: uuidv4(), title: 'Test' });
      const item = await itemRepo.save({
        id: uuidv4(),
        tripId: trip.id,
        type: 'transport',
        title: 'Train to Brussels',
        startDate: new Date(),
        endDate: new Date(),
        orderIndex: 0,
      });

      const transport = transportRepo.create({
        id: uuidv4(),
        itineraryItemId: item.id,
        transportType: 'train',
        provider: 'Eurostar',
        confirmationCode: 'EUR123',
        duration: 120,
      });

      const location = createTestLocation();
      transport.departureLocation = location;
      transport.arrivalLocation = location;

      const saved = await transportRepo.save(transport);

      expect(saved.transportType).toBe('train');
      expect(saved.provider).toBe('Eurostar');
      expect(saved.confirmationCode).toBe('EUR123');
      expect(saved.duration).toBe(120);
    });

    it('should handle JSON columns correctly', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);
      const transportRepo = dataSource.getRepository(Transport);

      const trip = await tripRepo.save({ id: uuidv4(), title: 'Test' });
      const item = await itemRepo.save({
        id: uuidv4(),
        tripId: trip.id,
        type: 'transport',
        title: 'Bus',
        startDate: new Date(),
        endDate: new Date(),
        orderIndex: 0,
      });

      const departure: Location = {
        address: 'Bus Station A',
        latitude: 40.7128,
        longitude: -74.006,
        city: 'New York',
      };

      const arrival: Location = {
        address: 'Bus Station B',
        latitude: 42.3601,
        longitude: -71.0589,
        city: 'Boston',
      };

      const transport = transportRepo.create({
        id: uuidv4(),
        itineraryItemId: item.id,
        transportType: 'bus',
        duration: 240,
      });

      transport.departureLocation = departure;
      transport.arrivalLocation = arrival;

      await transportRepo.save(transport);

      const found = await transportRepo.findOne({ where: { id: transport.id } });
      expect(found!.departureLocation.city).toBe('New York');
      expect(found!.arrivalLocation.city).toBe('Boston');
    });
  });

  describe('Accommodation Entity', () => {
    it('should create accommodation with all fields', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);
      const accomRepo = dataSource.getRepository(Accommodation);

      const trip = await tripRepo.save({ id: uuidv4(), title: 'Test' });
      const item = await itemRepo.save({
        id: uuidv4(),
        tripId: trip.id,
        type: 'accommodation',
        title: 'Hotel Stay',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-03'),
        orderIndex: 0,
      });

      const location: Location = {
        address: '123 Hotel Street',
        formattedAddress: '123 Hotel Street, Paris, France',
        latitude: 48.8566,
        longitude: 2.3522,
        city: 'Paris',
        country: 'France',
      };

      const accommodation = accomRepo.create({
        id: uuidv4(),
        itineraryItemId: item.id,
        name: 'Grand Hotel',
        confirmationNumber: 'HOTEL123',
        phoneNumber: '+33-1-2345-6789',
        duration: 2880, // 48 hours in minutes
      });

      accommodation.location = location;

      const saved = await accomRepo.save(accommodation);

      expect(saved.name).toBe('Grand Hotel');
      expect(saved.confirmationNumber).toBe('HOTEL123');
      expect(saved.phoneNumber).toBe('+33-1-2345-6789');
      expect(saved.duration).toBe(2880);
    });

    it('should parse location JSON correctly', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);
      const accomRepo = dataSource.getRepository(Accommodation);

      const trip = await tripRepo.save({ id: uuidv4(), title: 'Test' });
      const item = await itemRepo.save({
        id: uuidv4(),
        tripId: trip.id,
        type: 'accommodation',
        title: 'Airbnb',
        startDate: new Date(),
        endDate: new Date(),
        orderIndex: 0,
      });

      const location: Location = {
        address: 'Cozy Apartment',
        latitude: 51.5074,
        longitude: -0.1278,
        city: 'London',
        placeId: 'london-place-123',
      };

      const accommodation = accomRepo.create({
        id: uuidv4(),
        itineraryItemId: item.id,
        name: 'London Flat',
        duration: 1440,
      });

      accommodation.location = location;
      await accomRepo.save(accommodation);

      const found = await accomRepo.findOne({ where: { id: accommodation.id } });
      expect(found!.location.city).toBe('London');
      expect(found!.location.placeId).toBe('london-place-123');
      expect(found!.location.latitude).toBe(51.5074);
    });
  });

  describe('Complex Queries with Relations', () => {
    it('should query trip with all itinerary items', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);

      const trip = await tripRepo.save({
        id: uuidv4(),
        title: 'Multi-Item Trip',
      });

      // Create multiple items
      await itemRepo.save([
        {
          id: uuidv4(),
          tripId: trip.id,
          type: 'flight',
          title: 'Outbound Flight',
          startDate: new Date('2025-12-01T10:00:00Z'),
          endDate: new Date('2025-12-01T12:00:00Z'),
          orderIndex: 0,
        },
        {
          id: uuidv4(),
          tripId: trip.id,
          type: 'accommodation',
          title: 'Hotel',
          startDate: new Date('2025-12-01T14:00:00Z'),
          endDate: new Date('2025-12-03T10:00:00Z'),
          orderIndex: 1,
        },
        {
          id: uuidv4(),
          tripId: trip.id,
          type: 'flight',
          title: 'Return Flight',
          startDate: new Date('2025-12-03T16:00:00Z'),
          endDate: new Date('2025-12-03T18:00:00Z'),
          orderIndex: 2,
        },
      ]);

      const found = await tripRepo.findOne({
        where: { id: trip.id },
        relations: ['itineraryItems'],
      });

      expect(found).toBeDefined();
      expect(found!.itineraryItems.length).toBe(3);
      expect(found!.itineraryItems[0].title).toBe('Outbound Flight');
    });

    it('should sort itinerary items by startDate', async () => {
      const tripRepo = dataSource.getRepository(Trip);
      const itemRepo = dataSource.getRepository(ItineraryItem);

      const trip = await tripRepo.save({ id: uuidv4(), title: 'Test' });

      await itemRepo.save([
        {
          id: uuidv4(),
          tripId: trip.id,
          type: 'flight',
          title: 'Third',
          startDate: new Date('2025-12-03'),
          endDate: new Date('2025-12-03'),
          orderIndex: 2,
        },
        {
          id: uuidv4(),
          tripId: trip.id,
          type: 'flight',
          title: 'First',
          startDate: new Date('2025-12-01'),
          endDate: new Date('2025-12-01'),
          orderIndex: 0,
        },
        {
          id: uuidv4(),
          tripId: trip.id,
          type: 'flight',
          title: 'Second',
          startDate: new Date('2025-12-02'),
          endDate: new Date('2025-12-02'),
          orderIndex: 1,
        },
      ]);

      const items = await itemRepo.find({
        where: { tripId: trip.id },
        order: { startDate: 'ASC' },
      });

      expect(items.length).toBe(3);
      expect(items[0].title).toBe('First');
      expect(items[1].title).toBe('Second');
      expect(items[2].title).toBe('Third');
    });
  });
});
