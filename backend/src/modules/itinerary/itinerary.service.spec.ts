import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import { ItineraryRepository } from './itinerary.repository';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { Flight } from './entities/flight.entity';
import { Transport } from './entities/transport.entity';
import { Accommodation } from './entities/accommodation.entity';
import { Location } from './types/location.interface';

describe('ItineraryService', () => {
  let service: ItineraryService;
  let repository: jest.Mocked<ItineraryRepository>;

  const mockLocation: Location = {
    address: '123 Test St, Test City',
    city: 'Test City',
    country: 'Test Country',
    latitude: 40.7128,
    longitude: -74.0060,
  };

  const mockItem: ItineraryItem = {
    id: 'item-123',
    tripId: 'trip-123',
    type: 'flight',
    title: 'NYC to LAX',
    startDate: new Date('2024-07-01T10:00:00Z'),
    endDate: new Date('2024-07-01T15:00:00Z'),
    notes: 'Test flight',
    orderIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    trip: undefined as any,
  };

  const mockFlight: Flight = {
    id: 'flight-123',
    itineraryItemId: 'item-123',
    flightNumber: 'AA123',
    airline: 'American Airlines',
    confirmationCode: 'ABC123',
    duration: 300,
    departureLocationJson: JSON.stringify(mockLocation),
    arrivalLocationJson: JSON.stringify(mockLocation),
    departureLocation: mockLocation,
    arrivalLocation: mockLocation,
    itineraryItem: mockItem,
    toJSON() {
      return {
        id: this.id,
        itineraryItemId: this.itineraryItemId,
        departureLocation: this.departureLocation,
        arrivalLocation: this.arrivalLocation,
        flightNumber: this.flightNumber,
        airline: this.airline,
        confirmationCode: this.confirmationCode,
        duration: this.duration,
      };
    },
  };

  beforeEach(async () => {
    const mockRepository = {
      findByTripId: jest.fn(),
      findById: jest.fn(),
      createFlight: jest.fn(),
      createTransport: jest.fn(),
      createAccommodation: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      reorder: jest.fn(),
      countByTripId: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItineraryService,
        {
          provide: ItineraryRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ItineraryService>(ItineraryService);
    repository = module.get(ItineraryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByTripId', () => {
    it('should return items sorted chronologically', async () => {
      const items = [mockItem];
      repository.findByTripId.mockResolvedValue(items);

      const result = await service.findByTripId('trip-123');

      expect(result).toEqual(items);
      expect(repository.findByTripId).toHaveBeenCalledWith('trip-123');
    });

    it('should return empty array when no items exist', async () => {
      repository.findByTripId.mockResolvedValue([]);

      const result = await service.findByTripId('trip-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an item by id', async () => {
      repository.findById.mockResolvedValue(mockItem);

      const result = await service.findOne('item-123');

      expect(result).toEqual(mockItem);
      expect(repository.findById).toHaveBeenCalledWith('item-123');
    });

    it('should throw NotFoundException when item not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Itinerary item with ID "non-existent" not found',
      );
    });
  });

  describe('createFlight', () => {
    const validFlightData = {
      tripId: 'trip-123',
      title: 'NYC to LAX',
      startDate: new Date('2024-07-01T10:00:00Z'),
      endDate: new Date('2024-07-01T15:00:00Z'),
      departureLocation: mockLocation,
      arrivalLocation: { ...mockLocation, address: '456 Different St' },
      flightNumber: 'AA123',
      airline: 'American Airlines',
      confirmationCode: 'ABC123',
    };

    it('should create a flight with calculated duration', async () => {
      repository.createFlight.mockResolvedValue({
        item: mockItem,
        flight: mockFlight,
      });

      const result = await service.createFlight(validFlightData);

      expect(result.item).toEqual(mockItem);
      expect(result.flight).toEqual(mockFlight);
      expect(repository.createFlight).toHaveBeenCalledWith({
        ...validFlightData,
        duration: 300, // 5 hours in minutes
      });
    });

    it('should throw BadRequestException if arrival is before departure', async () => {
      const invalidData = {
        ...validFlightData,
        startDate: new Date('2024-07-01T15:00:00Z'),
        endDate: new Date('2024-07-01T10:00:00Z'),
      };

      await expect(service.createFlight(invalidData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createFlight(invalidData)).rejects.toThrow(
        'Arrival date must be after departure date',
      );
    });

    it('should throw BadRequestException if departure location missing', async () => {
      const invalidData = {
        ...validFlightData,
        departureLocation: null as any,
      };

      await expect(service.createFlight(invalidData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createFlight(invalidData)).rejects.toThrow(
        'Departure location is required',
      );
    });

    it('should throw BadRequestException if locations are the same', async () => {
      const invalidData = {
        ...validFlightData,
        arrivalLocation: mockLocation,
      };

      await expect(service.createFlight(invalidData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createFlight(invalidData)).rejects.toThrow(
        'Departure and arrival locations must be different',
      );
    });

    it('should throw BadRequestException for invalid coordinates', async () => {
      const invalidData = {
        ...validFlightData,
        departureLocation: { ...mockLocation, latitude: 100 }, // Invalid latitude
      };

      await expect(service.createFlight(invalidData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createTransport', () => {
    const validTransportData = {
      tripId: 'trip-123',
      title: 'Train to Boston',
      startDate: new Date('2024-07-02T08:00:00Z'),
      endDate: new Date('2024-07-02T12:00:00Z'),
      transportType: 'train',
      departureLocation: mockLocation,
      arrivalLocation: { ...mockLocation, address: '789 Boston St' },
      provider: 'Amtrak',
      confirmationCode: 'TRN123',
    };

    it('should create transport with calculated duration', async () => {
      const mockTransport = {
        id: 'transport-123',
        itineraryItemId: 'item-123',
        transportType: 'train',
        provider: 'Amtrak',
        confirmationCode: 'TRN123',
        duration: 240,
      } as Transport;

      repository.createTransport.mockResolvedValue({
        item: mockItem,
        transport: mockTransport,
      });

      const result = await service.createTransport(validTransportData);

      expect(result.item).toEqual(mockItem);
      expect(repository.createTransport).toHaveBeenCalledWith({
        ...validTransportData,
        duration: 240, // 4 hours in minutes
      });
    });

    it('should throw BadRequestException if transport type missing', async () => {
      const invalidData = {
        ...validTransportData,
        transportType: '',
      };

      await expect(service.createTransport(invalidData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createTransport(invalidData)).rejects.toThrow(
        'Transport type is required',
      );
    });

    it('should validate date range', async () => {
      const invalidData = {
        ...validTransportData,
        endDate: validTransportData.startDate,
      };

      await expect(service.createTransport(invalidData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createAccommodation', () => {
    const validAccommodationData = {
      tripId: 'trip-123',
      title: 'Hotel Stay',
      startDate: new Date('2024-07-01T15:00:00Z'),
      endDate: new Date('2024-07-03T11:00:00Z'),
      name: 'Grand Hotel',
      location: mockLocation,
      confirmationNumber: 'HTL123',
      phoneNumber: '+1-555-0100',
    };

    it('should create accommodation with calculated duration', async () => {
      const mockAccommodation = {
        id: 'accommodation-123',
        itineraryItemId: 'item-123',
        name: 'Grand Hotel',
        confirmationNumber: 'HTL123',
        phoneNumber: '+1-555-0100',
        duration: 2880,
      } as Accommodation;

      repository.createAccommodation.mockResolvedValue({
        item: mockItem,
        accommodation: mockAccommodation,
      });

      const result = await service.createAccommodation(validAccommodationData);

      expect(result.item).toEqual(mockItem);
      expect(repository.createAccommodation).toHaveBeenCalledWith({
        ...validAccommodationData,
        duration: 2640, // 1 day, 20 hours in minutes (44 hours)
      });
    });

    it('should throw BadRequestException if name is missing', async () => {
      const invalidData = {
        ...validAccommodationData,
        name: '',
      };

      await expect(service.createAccommodation(invalidData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createAccommodation(invalidData)).rejects.toThrow(
        'Accommodation name is required',
      );
    });

    it('should validate check-out after check-in', async () => {
      const invalidData = {
        ...validAccommodationData,
        startDate: new Date('2024-07-03T11:00:00Z'),
        endDate: new Date('2024-07-01T15:00:00Z'),
      };

      await expect(service.createAccommodation(invalidData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createAccommodation(invalidData)).rejects.toThrow(
        'Check-out date must be after check-in date',
      );
    });
  });

  describe('update', () => {
    it('should update an item successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        notes: 'Updated notes',
      };

      repository.findById.mockResolvedValue(mockItem);
      repository.update.mockResolvedValue({
        ...mockItem,
        ...updateData,
      });

      const result = await service.update('item-123', updateData);

      expect(result.title).toBe('Updated Title');
      expect(repository.update).toHaveBeenCalledWith('item-123', updateData);
    });

    it('should throw NotFoundException if item not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate date range when updating dates', async () => {
      const updateData = {
        startDate: new Date('2024-07-01T15:00:00Z'),
        endDate: new Date('2024-07-01T10:00:00Z'),
      };

      repository.findById.mockResolvedValue(mockItem);

      await expect(service.update('item-123', updateData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update('item-123', updateData)).rejects.toThrow(
        'End date must be after start date',
      );
    });

    it('should allow partial date updates', async () => {
      const updateData = {
        endDate: new Date('2024-07-01T16:00:00Z'),
      };

      repository.findById.mockResolvedValue(mockItem);
      repository.update.mockResolvedValue({
        ...mockItem,
        ...updateData,
      });

      const result = await service.update('item-123', updateData);

      expect(result).toBeDefined();
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an item successfully', async () => {
      repository.exists.mockResolvedValue(true);
      repository.delete.mockResolvedValue(true);

      await service.remove('item-123');

      expect(repository.exists).toHaveBeenCalledWith('item-123');
      expect(repository.delete).toHaveBeenCalledWith('item-123');
    });

    it('should throw NotFoundException if item not found', async () => {
      repository.exists.mockResolvedValue(false);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent')).rejects.toThrow(
        'Itinerary item with ID "non-existent" not found',
      );
    });

    it('should throw BadRequestException if delete fails', async () => {
      repository.exists.mockResolvedValue(true);
      repository.delete.mockResolvedValue(false);

      await expect(service.remove('item-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reorder', () => {
    it('should reorder items successfully', async () => {
      const updates = [
        { id: 'item-1', orderIndex: 0 },
        { id: 'item-2', orderIndex: 1 },
        { id: 'item-3', orderIndex: 2 },
      ];

      repository.exists.mockResolvedValue(true);
      repository.reorder.mockResolvedValue(undefined);

      await service.reorder(updates);

      expect(repository.exists).toHaveBeenCalledTimes(3);
      expect(repository.reorder).toHaveBeenCalledWith(updates);
    });

    it('should throw NotFoundException if any item not found', async () => {
      const updates = [
        { id: 'item-1', orderIndex: 0 },
        { id: 'non-existent', orderIndex: 1 },
      ];

      // Set up mock to return true for first item, false for second
      repository.exists.mockImplementation((id: string) => {
        return Promise.resolve(id === 'item-1');
      });

      await expect(service.reorder(updates)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.reorder(updates)).rejects.toThrow(
        'Itinerary item with ID "non-existent" not found',
      );
    });

    it('should throw BadRequestException for negative orderIndex', async () => {
      const updates = [{ id: 'item-1', orderIndex: -1 }];

      repository.exists.mockResolvedValue(true);

      await expect(service.reorder(updates)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.reorder(updates)).rejects.toThrow(
        'Order index must be non-negative',
      );
    });
  });

  describe('count', () => {
    it('should return count of items for a trip', async () => {
      repository.countByTripId.mockResolvedValue(5);

      const result = await service.count('trip-123');

      expect(result).toBe(5);
      expect(repository.countByTripId).toHaveBeenCalledWith('trip-123');
    });

    it('should return zero when no items exist', async () => {
      repository.countByTripId.mockResolvedValue(0);

      const result = await service.count('trip-123');

      expect(result).toBe(0);
    });
  });

  describe('exists', () => {
    it('should return true if item exists', async () => {
      repository.exists.mockResolvedValue(true);

      const result = await service.exists('item-123');

      expect(result).toBe(true);
      expect(repository.exists).toHaveBeenCalledWith('item-123');
    });

    it('should return false if item does not exist', async () => {
      repository.exists.mockResolvedValue(false);

      const result = await service.exists('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate duration correctly for short flights', async () => {
      const flightData = {
        tripId: 'trip-123',
        title: 'Short Flight',
        startDate: new Date('2024-07-01T10:00:00Z'),
        endDate: new Date('2024-07-01T11:30:00Z'), // 90 minutes
        departureLocation: mockLocation,
        arrivalLocation: { ...mockLocation, address: 'Different address' },
      };

      repository.createFlight.mockResolvedValue({
        item: mockItem,
        flight: mockFlight,
      });

      await service.createFlight(flightData);

      expect(repository.createFlight).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 90,
        }),
      );
    });

    it('should calculate duration correctly for multi-day accommodations', async () => {
      const accommodationData = {
        tripId: 'trip-123',
        title: 'Long Stay',
        startDate: new Date('2024-07-01T15:00:00Z'),
        endDate: new Date('2024-07-05T11:00:00Z'), // 3 days, 20 hours
        name: 'Hotel',
        location: mockLocation,
      };

      repository.createAccommodation.mockResolvedValue({
        item: mockItem,
        accommodation: {} as Accommodation,
      });

      await service.createAccommodation(accommodationData);

      expect(repository.createAccommodation).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 5520, // (3*24*60) + (20*60) = 5520 minutes
        }),
      );
    });
  });
});
