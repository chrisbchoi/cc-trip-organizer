import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ItineraryRepository } from './itinerary.repository';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { Flight } from './entities/flight.entity';
import { Transport } from './entities/transport.entity';
import { Accommodation } from './entities/accommodation.entity';

describe('ItineraryRepository', () => {
  let repository: ItineraryRepository;
  let itineraryItemRepository: Repository<ItineraryItem>;
  let flightRepository: Repository<Flight>;
  let transportRepository: Repository<Transport>;
  let accommodationRepository: Repository<Accommodation>;
  let dataSource: DataSource;

  // Mock data
  const mockTripId = 'trip-123';
  const mockItemId = 'item-456';
  const mockLocation = {
    address: '123 Main St',
    latitude: 40.7128,
    longitude: -74.006,
    city: 'New York',
    country: 'USA',
  };

  beforeEach(async () => {
    const mockTransaction = jest.fn((callback) => callback({
      create: jest.fn((entity, data) => data),
      save: jest.fn((entity, data) => Promise.resolve(data)),
      update: jest.fn(),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItineraryRepository,
        {
          provide: getRepositoryToken(ItineraryItem),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Flight),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Transport),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Accommodation),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: mockTransaction,
          },
        },
      ],
    }).compile();

    repository = module.get<ItineraryRepository>(ItineraryRepository);
    itineraryItemRepository = module.get(getRepositoryToken(ItineraryItem));
    flightRepository = module.get(getRepositoryToken(Flight));
    transportRepository = module.get(getRepositoryToken(Transport));
    accommodationRepository = module.get(getRepositoryToken(Accommodation));
    dataSource = module.get(DataSource);
  });

  describe('findByTripId', () => {
    it('should find all items for a trip sorted by startDate', async () => {
      const mockItems = [
        { id: '1', tripId: mockTripId, startDate: new Date('2024-01-01') },
        { id: '2', tripId: mockTripId, startDate: new Date('2024-01-02') },
      ];
      jest.spyOn(itineraryItemRepository, 'find').mockResolvedValue(mockItems as any);

      const result = await repository.findByTripId(mockTripId);

      expect(result.length).toBe(2);
      expect(itineraryItemRepository.find).toHaveBeenCalledWith({
        where: { tripId: mockTripId },
        order: {
          startDate: 'ASC',
          orderIndex: 'ASC',
        },
      });
    });

    it('should return empty array if no items found', async () => {
      jest.spyOn(itineraryItemRepository, 'find').mockResolvedValue([]);

      const result = await repository.findByTripId(mockTripId);

      expect(result.length).toBe(0);
    });
  });

  describe('findById', () => {
    it('should find an item and load flight relation', async () => {
      const mockItem = { id: mockItemId, type: 'flight', tripId: mockTripId };
      const mockFlight = { id: 'flight-1', itineraryItemId: mockItemId };

      jest.spyOn(itineraryItemRepository, 'findOne').mockResolvedValue(mockItem as any);
      jest.spyOn(flightRepository, 'findOne').mockResolvedValue(mockFlight as any);

      const result = await repository.findById(mockItemId);

      expect(result).toBeDefined();
      expect((result as any).flight).toEqual(mockFlight);
    });

    it('should find an item and load transport relation', async () => {
      const mockItem = { id: mockItemId, type: 'transport', tripId: mockTripId };
      const mockTransport = { id: 'transport-1', itineraryItemId: mockItemId };

      jest.spyOn(itineraryItemRepository, 'findOne').mockResolvedValue(mockItem as any);
      jest.spyOn(transportRepository, 'findOne').mockResolvedValue(mockTransport as any);

      const result = await repository.findById(mockItemId);

      expect(result).toBeDefined();
      expect((result as any).transport).toEqual(mockTransport);
    });

    it('should find an item and load accommodation relation', async () => {
      const mockItem = { id: mockItemId, type: 'accommodation', tripId: mockTripId };
      const mockAccommodation = { id: 'acc-1', itineraryItemId: mockItemId };

      jest.spyOn(itineraryItemRepository, 'findOne').mockResolvedValue(mockItem as any);
      jest.spyOn(accommodationRepository, 'findOne').mockResolvedValue(mockAccommodation as any);

      const result = await repository.findById(mockItemId);

      expect(result).toBeDefined();
      expect((result as any).accommodation).toEqual(mockAccommodation);
    });

    it('should return null if item not found', async () => {
      jest.spyOn(itineraryItemRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.findById(mockItemId);

      expect(result).toBeNull();
    });
  });

  describe('createFlight', () => {
    it('should create a flight with itinerary item in a transaction', async () => {
      const flightData = {
        tripId: mockTripId,
        title: 'Flight to NYC',
        startDate: new Date('2024-01-01T10:00:00'),
        endDate: new Date('2024-01-01T14:00:00'),
        notes: 'Window seat preferred',
        departureLocation: mockLocation,
        arrivalLocation: { ...mockLocation, city: 'Boston' },
        flightNumber: 'AA123',
        airline: 'American Airlines',
        confirmationCode: 'ABC123',
        duration: 240,
      };

      const result = await repository.createFlight(flightData);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result['item']).toBeDefined();
      expect(result['flight']).toBeDefined();
    });
  });

  describe('createTransport', () => {
    it('should create transport with itinerary item in a transaction', async () => {
      const transportData = {
        tripId: mockTripId,
        title: 'Train to Boston',
        startDate: new Date('2024-01-02T08:00:00'),
        endDate: new Date('2024-01-02T12:00:00'),
        transportType: 'train',
        departureLocation: mockLocation,
        arrivalLocation: { ...mockLocation, city: 'Boston' },
        provider: 'Amtrak',
        confirmationCode: 'TRAIN123',
        duration: 240,
      };

      const result = await repository.createTransport(transportData);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result['item']).toBeDefined();
      expect(result['transport']).toBeDefined();
    });
  });

  describe('createAccommodation', () => {
    it('should create accommodation with itinerary item in a transaction', async () => {
      const accommodationData = {
        tripId: mockTripId,
        title: 'Hotel Stay',
        startDate: new Date('2024-01-01T15:00:00'),
        endDate: new Date('2024-01-03T11:00:00'),
        name: 'Grand Hotel',
        location: mockLocation,
        confirmationNumber: 'HOTEL123',
        phoneNumber: '+1-555-1234',
        duration: 2880,
      };

      const result = await repository.createAccommodation(accommodationData);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result['item']).toBeDefined();
      expect(result['accommodation']).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update an itinerary item', async () => {
      const mockItem = { id: mockItemId, title: 'Updated Title' } as any;
      jest.spyOn(itineraryItemRepository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(itineraryItemRepository, 'findOne').mockResolvedValue(mockItem);

      const result = await repository.update(mockItemId, { title: 'Updated Title' });

      expect(itineraryItemRepository.update).toHaveBeenCalledWith(mockItemId, { title: 'Updated Title' });
      expect(result).toBeDefined();
    });
  });

  describe('updateFlight', () => {
    it('should update flight-specific data', async () => {
      const mockFlight = {
        id: 'flight-1',
        itineraryItemId: mockItemId,
        flightNumber: 'AA123',
        departureLocationJson: JSON.stringify(mockLocation),
        arrivalLocationJson: JSON.stringify(mockLocation),
        get departureLocation() {
          return JSON.parse(this.departureLocationJson);
        },
        set departureLocation(loc) {
          this.departureLocationJson = JSON.stringify(loc);
        },
        get arrivalLocation() {
          return JSON.parse(this.arrivalLocationJson);
        },
        set arrivalLocation(loc) {
          this.arrivalLocationJson = JSON.stringify(loc);
        },
      };

      jest.spyOn(flightRepository, 'findOne').mockResolvedValue(mockFlight as any);
      jest.spyOn(flightRepository, 'save').mockResolvedValue(mockFlight as any);

      const result = await repository.updateFlight(mockItemId, {
        flightNumber: 'AA456',
        departureLocation: mockLocation,
      });

      expect(result).toBeDefined();
      expect(flightRepository.save).toHaveBeenCalled();
    });

    it('should return null if flight not found', async () => {
      jest.spyOn(flightRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.updateFlight(mockItemId, { flightNumber: 'AA456' });

      expect(result).toBeNull();
    });
  });

  describe('updateTransport', () => {
    it('should update transport-specific data', async () => {
      const mockTransport = {
        id: 'transport-1',
        itineraryItemId: mockItemId,
        transportType: 'train',
        departureLocationJson: JSON.stringify(mockLocation),
        arrivalLocationJson: JSON.stringify(mockLocation),
        get departureLocation() {
          return JSON.parse(this.departureLocationJson);
        },
        set departureLocation(loc) {
          this.departureLocationJson = JSON.stringify(loc);
        },
        get arrivalLocation() {
          return JSON.parse(this.arrivalLocationJson);
        },
        set arrivalLocation(loc) {
          this.arrivalLocationJson = JSON.stringify(loc);
        },
      };

      jest.spyOn(transportRepository, 'findOne').mockResolvedValue(mockTransport as any);
      jest.spyOn(transportRepository, 'save').mockResolvedValue(mockTransport as any);

      const result = await repository.updateTransport(mockItemId, { transportType: 'bus' });

      expect(result).toBeDefined();
      expect(transportRepository.save).toHaveBeenCalled();
    });

    it('should return null if transport not found', async () => {
      jest.spyOn(transportRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.updateTransport(mockItemId, { transportType: 'bus' });

      expect(result).toBeNull();
    });
  });

  describe('updateAccommodation', () => {
    it('should update accommodation-specific data', async () => {
      const mockAccommodation = {
        id: 'acc-1',
        itineraryItemId: mockItemId,
        name: 'Grand Hotel',
        locationJson: JSON.stringify(mockLocation),
        get location() {
          return JSON.parse(this.locationJson);
        },
        set location(loc) {
          this.locationJson = JSON.stringify(loc);
        },
      };

      jest.spyOn(accommodationRepository, 'findOne').mockResolvedValue(mockAccommodation as any);
      jest.spyOn(accommodationRepository, 'save').mockResolvedValue(mockAccommodation as any);

      const result = await repository.updateAccommodation(mockItemId, { name: 'Updated Hotel' });

      expect(result).toBeDefined();
      expect(accommodationRepository.save).toHaveBeenCalled();
    });

    it('should return null if accommodation not found', async () => {
      jest.spyOn(accommodationRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.updateAccommodation(mockItemId, { name: 'Updated Hotel' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an itinerary item', async () => {
      jest.spyOn(itineraryItemRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await repository.delete(mockItemId);

      expect(result).toBe(true);
      expect(itineraryItemRepository.delete).toHaveBeenCalledWith(mockItemId);
    });

    it('should return false if item not found', async () => {
      jest.spyOn(itineraryItemRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

      const result = await repository.delete(mockItemId);

      expect(result).toBe(false);
    });
  });

  describe('reorder', () => {
    it('should update orderIndex for multiple items in a transaction', async () => {
      const updates = [
        { id: 'item-1', orderIndex: 0 },
        { id: 'item-2', orderIndex: 1 },
        { id: 'item-3', orderIndex: 2 },
      ];

      await repository.reorder(updates);

      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  describe('countByTripId', () => {
    it('should count items for a trip', async () => {
      jest.spyOn(itineraryItemRepository, 'count').mockResolvedValue(5);

      const result = await repository.countByTripId(mockTripId);

      expect(result).toBe(5);
      expect(itineraryItemRepository.count).toHaveBeenCalledWith({ where: { tripId: mockTripId } });
    });
  });

  describe('exists', () => {
    it('should return true if item exists', async () => {
      jest.spyOn(itineraryItemRepository, 'count').mockResolvedValue(1);

      const result = await repository.exists(mockItemId);

      expect(result).toBe(true);
    });

    it('should return false if item does not exist', async () => {
      jest.spyOn(itineraryItemRepository, 'count').mockResolvedValue(0);

      const result = await repository.exists(mockItemId);

      expect(result).toBe(false);
    });
  });
});
