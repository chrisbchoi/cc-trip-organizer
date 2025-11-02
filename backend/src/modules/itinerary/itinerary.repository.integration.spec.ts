import { DataSource } from 'typeorm';
import { ItineraryRepository } from './itinerary.repository';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { Flight } from './entities/flight.entity';
import { Transport } from './entities/transport.entity';
import { Accommodation } from './entities/accommodation.entity';
import { Trip } from '../trips/entities/trip.entity';
import { v4 as uuidv4 } from 'uuid';

describe('ItineraryRepository Integration Tests', () => {
  let dataSource: DataSource;
  let repository: ItineraryRepository;
  let testTripId: string;

  const mockLocation = {
    address: '123 Main St, New York, NY',
    latitude: 40.7128,
    longitude: -74.006,
    city: 'New York',
    country: 'USA',
  };

  beforeAll(async () => {
    // Create in-memory database
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [Trip, ItineraryItem, Flight, Transport, Accommodation],
      synchronize: true,
      logging: false,
    });

    await dataSource.initialize();

    // Create repository instance
    repository = new ItineraryRepository(
      dataSource.getRepository(ItineraryItem),
      dataSource.getRepository(Flight),
      dataSource.getRepository(Transport),
      dataSource.getRepository(Accommodation),
      dataSource,
    );

    // Create a test trip
    testTripId = uuidv4();
    const tripRepo = dataSource.getRepository(Trip);
    await tripRepo.save({
      id: testTripId,
      title: 'Test Trip',
      description: 'A test trip for integration testing',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-10'),
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  afterEach(async () => {
    // Clean up itinerary items after each test
    await dataSource.getRepository(Flight).clear();
    await dataSource.getRepository(Transport).clear();
    await dataSource.getRepository(Accommodation).clear();
    await dataSource.getRepository(ItineraryItem).clear();
  });

  describe('Flight Operations', () => {
    it('should create a flight with all related data', async () => {
      const flightData = {
        tripId: testTripId,
        title: 'Flight to Boston',
        startDate: new Date('2024-01-01T10:00:00'),
        endDate: new Date('2024-01-01T14:00:00'),
        notes: 'Window seat',
        orderIndex: 0,
        departureLocation: mockLocation,
        arrivalLocation: { ...mockLocation, city: 'Boston' },
        flightNumber: 'AA123',
        airline: 'American Airlines',
        confirmationCode: 'ABC123',
        duration: 240,
      };

      const result = await repository.createFlight(flightData);

      expect(result.item).toBeDefined();
      expect(result.item.id).toBeDefined();
      expect(result.item.type).toBe('flight');
      expect(result.item.title).toBe('Flight to Boston');

      expect(result.flight).toBeDefined();
      expect(result.flight.flightNumber).toBe('AA123');
      expect(result.flight.airline).toBe('American Airlines');
      expect(result.flight.departureLocation.city).toBe('New York');
      expect(result.flight.arrivalLocation.city).toBe('Boston');
    });

    it('should retrieve flight with findById', async () => {
      const flightData = {
        tripId: testTripId,
        title: 'Flight Test',
        startDate: new Date('2024-01-02T10:00:00'),
        endDate: new Date('2024-01-02T14:00:00'),
        departureLocation: mockLocation,
        arrivalLocation: mockLocation,
        duration: 240,
      };

      const created = await repository.createFlight(flightData);
      const retrieved = await repository.findById(created.item.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(created.item.id);
      expect((retrieved as any).flight).toBeDefined();
      expect((retrieved as any).flight.duration).toBe(240);
    });

    it('should update flight data', async () => {
      const flightData = {
        tripId: testTripId,
        title: 'Original Flight',
        startDate: new Date('2024-01-03T10:00:00'),
        endDate: new Date('2024-01-03T14:00:00'),
        departureLocation: mockLocation,
        arrivalLocation: mockLocation,
        flightNumber: 'AA111',
        duration: 240,
      };

      const created = await repository.createFlight(flightData);

      const updated = await repository.updateFlight(created.item.id, {
        flightNumber: 'AA222',
        airline: 'Delta Airlines',
      });

      expect(updated).toBeDefined();
      expect(updated!.flightNumber).toBe('AA222');
      expect(updated!.airline).toBe('Delta Airlines');
    });

    it('should delete flight with CASCADE', async () => {
      const flightData = {
        tripId: testTripId,
        title: 'Delete Test Flight',
        startDate: new Date('2024-01-04T10:00:00'),
        endDate: new Date('2024-01-04T14:00:00'),
        departureLocation: mockLocation,
        arrivalLocation: mockLocation,
        duration: 240,
      };

      const created = await repository.createFlight(flightData);
      const deleted = await repository.delete(created.item.id);

      expect(deleted).toBe(true);

      const retrieved = await repository.findById(created.item.id);
      expect(retrieved).toBeNull();

      // Verify flight-specific data is also deleted
      const flight = await dataSource.getRepository(Flight).findOne({
        where: { itineraryItemId: created.item.id },
      });
      expect(flight).toBeNull();
    });
  });

  describe('Transport Operations', () => {
    it('should create transport with all related data', async () => {
      const transportData = {
        tripId: testTripId,
        title: 'Train to Boston',
        startDate: new Date('2024-01-05T08:00:00'),
        endDate: new Date('2024-01-05T12:00:00'),
        transportType: 'train',
        departureLocation: mockLocation,
        arrivalLocation: { ...mockLocation, city: 'Boston' },
        provider: 'Amtrak',
        confirmationCode: 'TRAIN123',
        duration: 240,
      };

      const result = await repository.createTransport(transportData);

      expect(result.item).toBeDefined();
      expect(result.item.type).toBe('transport');
      expect(result.transport).toBeDefined();
      expect(result.transport.transportType).toBe('train');
      expect(result.transport.provider).toBe('Amtrak');
    });

    it('should update transport data', async () => {
      const transportData = {
        tripId: testTripId,
        title: 'Bus Trip',
        startDate: new Date('2024-01-06T08:00:00'),
        endDate: new Date('2024-01-06T12:00:00'),
        transportType: 'bus',
        departureLocation: mockLocation,
        arrivalLocation: mockLocation,
        duration: 240,
      };

      const created = await repository.createTransport(transportData);

      const updated = await repository.updateTransport(created.item.id, {
        transportType: 'train',
        provider: 'Updated Provider',
      });

      expect(updated).toBeDefined();
      expect(updated!.transportType).toBe('train');
      expect(updated!.provider).toBe('Updated Provider');
    });
  });

  describe('Accommodation Operations', () => {
    it('should create accommodation with all related data', async () => {
      const accommodationData = {
        tripId: testTripId,
        title: 'Hotel Stay',
        startDate: new Date('2024-01-07T15:00:00'),
        endDate: new Date('2024-01-09T11:00:00'),
        name: 'Grand Hotel',
        location: mockLocation,
        confirmationNumber: 'HOTEL123',
        phoneNumber: '+1-555-1234',
        duration: 2880,
      };

      const result = await repository.createAccommodation(accommodationData);

      expect(result.item).toBeDefined();
      expect(result.item.type).toBe('accommodation');
      expect(result.accommodation).toBeDefined();
      expect(result.accommodation.name).toBe('Grand Hotel');
      expect(result.accommodation.phoneNumber).toBe('+1-555-1234');
      expect(result.accommodation.location.city).toBe('New York');
    });

    it('should update accommodation data', async () => {
      const accommodationData = {
        tripId: testTripId,
        title: 'Hotel',
        startDate: new Date('2024-01-08T15:00:00'),
        endDate: new Date('2024-01-09T11:00:00'),
        name: 'Original Hotel',
        location: mockLocation,
        duration: 1200,
      };

      const created = await repository.createAccommodation(accommodationData);

      const updated = await repository.updateAccommodation(created.item.id, {
        name: 'Updated Hotel',
        phoneNumber: '+1-555-9999',
      });

      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated Hotel');
      expect(updated!.phoneNumber).toBe('+1-555-9999');
    });
  });

  describe('findByTripId', () => {
    it('should retrieve all items for a trip sorted by startDate', async () => {
      // Create items with different dates
      await repository.createFlight({
        tripId: testTripId,
        title: 'Flight 1',
        startDate: new Date('2024-01-03T10:00:00'),
        endDate: new Date('2024-01-03T14:00:00'),
        departureLocation: mockLocation,
        arrivalLocation: mockLocation,
        duration: 240,
      });

      await repository.createTransport({
        tripId: testTripId,
        title: 'Transport 1',
        startDate: new Date('2024-01-01T08:00:00'),
        endDate: new Date('2024-01-01T12:00:00'),
        transportType: 'train',
        departureLocation: mockLocation,
        arrivalLocation: mockLocation,
        duration: 240,
      });

      await repository.createAccommodation({
        tripId: testTripId,
        title: 'Hotel 1',
        startDate: new Date('2024-01-02T15:00:00'),
        endDate: new Date('2024-01-04T11:00:00'),
        name: 'Hotel',
        location: mockLocation,
        duration: 2880,
      });

      const items = await repository.findByTripId(testTripId);

      expect(items.length).toBe(3);
      // Verify chronological order
      expect(items[0].title).toBe('Transport 1');
      expect(items[1].title).toBe('Hotel 1');
      expect(items[2].title).toBe('Flight 1');
    });
  });

  describe('reorder', () => {
    it('should update orderIndex for multiple items', async () => {
      const flight = await repository.createFlight({
        tripId: testTripId,
        title: 'Flight',
        startDate: new Date('2024-01-01T10:00:00'),
        endDate: new Date('2024-01-01T14:00:00'),
        departureLocation: mockLocation,
        arrivalLocation: mockLocation,
        duration: 240,
        orderIndex: 0,
      });

      const transport = await repository.createTransport({
        tripId: testTripId,
        title: 'Transport',
        startDate: new Date('2024-01-01T08:00:00'),
        endDate: new Date('2024-01-01T12:00:00'),
        transportType: 'train',
        departureLocation: mockLocation,
        arrivalLocation: mockLocation,
        duration: 240,
        orderIndex: 1,
      });

      // Swap order
      await repository.reorder([
        { id: flight.item.id, orderIndex: 1 },
        { id: transport.item.id, orderIndex: 0 },
      ]);

      const items = await repository.findByTripId(testTripId);
      const sortedItems = items.sort((a, b) => a.orderIndex - b.orderIndex);

      expect(sortedItems[0].id).toBe(transport.item.id);
      expect(sortedItems[1].id).toBe(flight.item.id);
    });
  });

  describe('count and exists', () => {
    it('should count items for a trip', async () => {
      await repository.createFlight({
        tripId: testTripId,
        title: 'Flight',
        startDate: new Date('2024-01-01T10:00:00'),
        endDate: new Date('2024-01-01T14:00:00'),
        departureLocation: mockLocation,
        arrivalLocation: mockLocation,
        duration: 240,
      });

      await repository.createTransport({
        tripId: testTripId,
        title: 'Transport',
        startDate: new Date('2024-01-02T08:00:00'),
        endDate: new Date('2024-01-02T12:00:00'),
        transportType: 'train',
        departureLocation: mockLocation,
        arrivalLocation: mockLocation,
        duration: 240,
      });

      const count = await repository.countByTripId(testTripId);
      expect(count).toBe(2);
    });

    it('should check if an item exists', async () => {
      const created = await repository.createFlight({
        tripId: testTripId,
        title: 'Flight',
        startDate: new Date('2024-01-01T10:00:00'),
        endDate: new Date('2024-01-01T14:00:00'),
        departureLocation: mockLocation,
        arrivalLocation: mockLocation,
        duration: 240,
      });

      const exists = await repository.exists(created.item.id);
      expect(exists).toBe(true);

      const notExists = await repository.exists('non-existent-id');
      expect(notExists).toBe(false);
    });
  });
});
