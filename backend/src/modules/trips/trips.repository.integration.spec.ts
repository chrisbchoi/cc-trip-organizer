/**
 * Integration test for TripsRepository
 * This test uses the actual database to verify CRUD operations
 * 
 * Run with: npm test -- trips.repository.integration.spec.ts
 */

import { DataSource } from 'typeorm';
import { Trip } from './entities/trip.entity';
import { TripsRepository } from './trips.repository';
import { v4 as uuidv4 } from 'uuid';

describe('TripsRepository Integration Tests', () => {
  let dataSource: DataSource;
  let repository: TripsRepository;
  let tripRepository: any;

  beforeAll(async () => {
    // Initialize test database connection
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:', // Use in-memory database for testing
      entities: [Trip],
      synchronize: true, // Auto-create schema for tests
      logging: false,
    });

    await dataSource.initialize();
    tripRepository = dataSource.getRepository(Trip);
    repository = new TripsRepository(tripRepository);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  afterEach(async () => {
    // Clean up after each test
    await tripRepository.clear();
  });

  describe('create and findById', () => {
    it('should create a trip and retrieve it by ID', async () => {
      const tripData = {
        id: uuidv4(),
        title: 'Summer Vacation 2025',
        description: 'A trip to Europe',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-15'),
      };

      const createdTrip = await repository.create(tripData);

      expect(createdTrip).toBeDefined();
      expect(createdTrip.id).toBe(tripData.id);
      expect(createdTrip.title).toBe(tripData.title);
      expect(createdTrip.description).toBe(tripData.description);
      expect(createdTrip.createdAt).toBeDefined();
      expect(createdTrip.updatedAt).toBeDefined();

      const foundTrip = await repository.findById(createdTrip.id);
      expect(foundTrip).toBeDefined();
      expect(foundTrip?.id).toBe(createdTrip.id);
      expect(foundTrip?.title).toBe(createdTrip.title);
    });

    it('should return null for non-existent trip', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all trips ordered by creation date', async () => {
      // Create multiple trips
      const trip1 = await repository.create({
        id: uuidv4(),
        title: 'Trip 1',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-07'),
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const trip2 = await repository.create({
        id: uuidv4(),
        title: 'Trip 2',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-07'),
      });

      const allTrips = await repository.findAll();

      expect(allTrips).toHaveLength(2);
      // Should be ordered by createdAt DESC (newest first)
      expect(allTrips[0].id).toBe(trip2.id);
      expect(allTrips[1].id).toBe(trip1.id);
    });

    it('should return empty array when no trips exist', async () => {
      const allTrips = await repository.findAll();
      expect(allTrips).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update trip fields', async () => {
      const trip = await repository.create({
        id: uuidv4(),
        title: 'Original Title',
        description: 'Original Description',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-07'),
      });

      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const updatedTrip = await repository.update(trip.id, updateData);

      expect(updatedTrip).toBeDefined();
      expect(updatedTrip?.title).toBe(updateData.title);
      expect(updatedTrip?.description).toBe(updateData.description);
      expect(updatedTrip?.startDate).toEqual(trip.startDate);
      expect(updatedTrip?.endDate).toEqual(trip.endDate);
    });

    it('should return null when updating non-existent trip', async () => {
      const result = await repository.update('non-existent-id', { title: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a trip', async () => {
      const trip = await repository.create({
        id: uuidv4(),
        title: 'Trip to Delete',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-04-07'),
      });

      const deleteResult = await repository.delete(trip.id);
      expect(deleteResult).toBe(true);

      const foundTrip = await repository.findById(trip.id);
      expect(foundTrip).toBeNull();
    });

    it('should return false when deleting non-existent trip', async () => {
      const result = await repository.delete('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count trips correctly', async () => {
      expect(await repository.count()).toBe(0);

      await repository.create({
        id: uuidv4(),
        title: 'Trip 1',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-07'),
      });

      expect(await repository.count()).toBe(1);

      await repository.create({
        id: uuidv4(),
        title: 'Trip 2',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-07'),
      });

      expect(await repository.count()).toBe(2);
    });
  });

  describe('exists', () => {
    it('should return true for existing trip', async () => {
      const trip = await repository.create({
        id: uuidv4(),
        title: 'Test Trip',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-07'),
      });

      const exists = await repository.exists(trip.id);
      expect(exists).toBe(true);
    });

    it('should return false for non-existent trip', async () => {
      const exists = await repository.exists('non-existent-id');
      expect(exists).toBe(false);
    });
  });

  describe('timestamps', () => {
    it('should auto-populate createdAt and updatedAt', async () => {
      const trip = await repository.create({
        id: uuidv4(),
        title: 'Timestamp Test',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-07'),
      });

      expect(trip.createdAt).toBeDefined();
      expect(trip.updatedAt).toBeDefined();
      expect(trip.createdAt).toBeInstanceOf(Date);
      expect(trip.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const trip = await repository.create({
        id: uuidv4(),
        title: 'Update Test',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-07'),
      });

      const originalUpdatedAt = trip.updatedAt;

      // Wait to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await repository.update(trip.id, { title: 'Modified Title' });
      const updatedTrip = await repository.findById(trip.id);

      expect(updatedTrip?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
