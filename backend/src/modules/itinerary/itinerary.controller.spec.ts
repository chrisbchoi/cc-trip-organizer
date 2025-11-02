import { Test, TestingModule } from '@nestjs/testing';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { CreateTransportDto } from './dto/create-transport.dto';
import { CreateAccommodationDto } from './dto/create-accommodation.dto';
import { UpdateItineraryItemDto } from './dto/update-itinerary-item.dto';
import { ReorderItemsDto } from './dto/reorder-items.dto';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { Flight } from './entities/flight.entity';
import { Transport } from './entities/transport.entity';
import { Accommodation } from './entities/accommodation.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ItineraryController', () => {
  let controller: ItineraryController;
  let service: ItineraryService;

  const mockItineraryService = {
    findByTripId: jest.fn(),
    findOne: jest.fn(),
    createFlight: jest.fn(),
    createTransport: jest.fn(),
    createAccommodation: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reorder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItineraryController],
      providers: [
        {
          provide: ItineraryService,
          useValue: mockItineraryService,
        },
      ],
    }).compile();

    controller = module.get<ItineraryController>(ItineraryController);
    service = module.get<ItineraryService>(ItineraryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByTripId', () => {
    it('should return all itinerary items for a trip', async () => {
      const tripId = 'trip-1';
      const items = [
        {
          id: 'item-1',
          tripId,
          type: 'flight',
          title: 'Flight to Paris',
          startDate: new Date('2024-06-01T10:00:00Z'),
          endDate: new Date('2024-06-01T13:00:00Z'),
          duration: 180,
          orderIndex: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Partial<ItineraryItem>,
      ] as ItineraryItem[];

      mockItineraryService.findByTripId.mockResolvedValue(items);

      const result = await controller.findByTripId(tripId);

      expect(result).toEqual(items);
      expect(service.findByTripId).toHaveBeenCalledWith(tripId);
    });

    it('should return empty array if no items found', async () => {
      const tripId = 'trip-2';
      mockItineraryService.findByTripId.mockResolvedValue([]);

      const result = await controller.findByTripId(tripId);

      expect(result).toEqual([]);
      expect(service.findByTripId).toHaveBeenCalledWith(tripId);
    });
  });

  describe('findOne', () => {
    it('should return a single itinerary item', async () => {
      const itemId = 'item-1';
      const item = {
        id: itemId,
        tripId: 'trip-1',
        type: 'flight',
        title: 'Flight to Paris',
        startDate: new Date('2024-06-01T10:00:00Z'),
        endDate: new Date('2024-06-01T13:00:00Z'),
        duration: 180,
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Partial<ItineraryItem> as ItineraryItem;

      mockItineraryService.findOne.mockResolvedValue(item);

      const result = await controller.findOne(itemId);

      expect(result).toEqual(item);
      expect(service.findOne).toHaveBeenCalledWith(itemId);
    });

    it('should throw NotFoundException if item not found', async () => {
      const itemId = 'non-existent';
      mockItineraryService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(itemId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(itemId);
    });
  });

  describe('createFlight', () => {
    const tripId = 'trip-1';
    const createFlightDto: CreateFlightDto = {
      title: 'Flight to Paris',
      startDate: '2024-06-01T10:00:00Z',
      endDate: '2024-06-01T13:00:00Z',
      notes: 'Business class',
      orderIndex: 0,
      departureLocation: {
        address: 'JFK Airport',
        city: 'New York',
        country: 'USA',
        latitude: 40.6413,
        longitude: -73.7781,
      },
      arrivalLocation: {
        address: 'CDG Airport',
        city: 'Paris',
        country: 'France',
        latitude: 49.0097,
        longitude: 2.5479,
      },
      flightNumber: 'AF123',
      airline: 'Air France',
      confirmationCode: 'ABC123',
    };

    it('should create a flight with coordinates', async () => {
      const item = { id: 'item-1', tripId } as Partial<ItineraryItem> as ItineraryItem;
      const flight = { id: 'flight-1', itemId: 'item-1' } as Partial<Flight> as Flight;

      mockItineraryService.createFlight.mockResolvedValue({ item, flight });

      const result = await controller.createFlight(tripId, createFlightDto);

      expect(result).toEqual({ item, flight });
      expect(service.createFlight).toHaveBeenCalledWith({
        ...createFlightDto,
        tripId,
        startDate: new Date(createFlightDto.startDate),
        endDate: new Date(createFlightDto.endDate),
        departureLocation: {
          ...createFlightDto.departureLocation,
          latitude: 40.6413,
          longitude: -73.7781,
        },
        arrivalLocation: {
          ...createFlightDto.arrivalLocation,
          latitude: 49.0097,
          longitude: 2.5479,
        },
      });
    });

    it('should create a flight with default coordinates when missing', async () => {
      const dtoWithoutCoords: CreateFlightDto = {
        ...createFlightDto,
        departureLocation: {
          address: 'JFK Airport',
          city: 'New York',
          country: 'USA',
          latitude: null,
          longitude: null,
        },
        arrivalLocation: {
          address: 'CDG Airport',
          city: 'Paris',
          country: 'France',
          latitude: undefined,
          longitude: undefined,
        },
      };

      const item = { id: 'item-1', tripId } as Partial<ItineraryItem> as ItineraryItem;
      const flight = { id: 'flight-1', itemId: 'item-1' } as Partial<Flight> as Flight;

      mockItineraryService.createFlight.mockResolvedValue({ item, flight });

      const result = await controller.createFlight(tripId, dtoWithoutCoords);

      expect(result).toEqual({ item, flight });
      expect(service.createFlight).toHaveBeenCalledWith({
        ...dtoWithoutCoords,
        tripId,
        startDate: new Date(dtoWithoutCoords.startDate),
        endDate: new Date(dtoWithoutCoords.endDate),
        departureLocation: {
          ...dtoWithoutCoords.departureLocation,
          latitude: 0,
          longitude: 0,
        },
        arrivalLocation: {
          ...dtoWithoutCoords.arrivalLocation,
          latitude: 0,
          longitude: 0,
        },
      });
    });

    it('should throw BadRequestException on validation error', async () => {
      mockItineraryService.createFlight.mockRejectedValue(
        new BadRequestException('Arrival must be after departure'),
      );

      await expect(controller.createFlight(tripId, createFlightDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createTransport', () => {
    const tripId = 'trip-1';
    const createTransportDto: CreateTransportDto = {
      title: 'Train to Lyon',
      startDate: '2024-06-05T09:00:00Z',
      endDate: '2024-06-05T11:00:00Z',
      notes: 'First class',
      orderIndex: 1,
      departureLocation: {
        address: 'Gare de Lyon',
        city: 'Paris',
        country: 'France',
        latitude: 48.8449,
        longitude: 2.3741,
      },
      arrivalLocation: {
        address: 'Lyon Part-Dieu',
        city: 'Lyon',
        country: 'France',
        latitude: 45.7604,
        longitude: 4.8592,
      },
      transportType: 'train',
      provider: 'SNCF',
      confirmationCode: 'TRN456',
    };

    it('should create a transport with coordinates', async () => {
      const item = { id: 'item-2', tripId } as Partial<ItineraryItem> as ItineraryItem;
      const transport = { id: 'transport-1', itemId: 'item-2' } as Partial<Transport> as Transport;

      mockItineraryService.createTransport.mockResolvedValue({ item, transport });

      const result = await controller.createTransport(tripId, createTransportDto);

      expect(result).toEqual({ item, transport });
      expect(service.createTransport).toHaveBeenCalledWith({
        ...createTransportDto,
        tripId,
        startDate: new Date(createTransportDto.startDate),
        endDate: new Date(createTransportDto.endDate),
        departureLocation: {
          ...createTransportDto.departureLocation,
          latitude: 48.8449,
          longitude: 2.3741,
        },
        arrivalLocation: {
          ...createTransportDto.arrivalLocation,
          latitude: 45.7604,
          longitude: 4.8592,
        },
      });
    });

    it('should create a transport with default coordinates when missing', async () => {
      const dtoWithoutCoords: CreateTransportDto = {
        ...createTransportDto,
        departureLocation: {
          address: 'Gare de Lyon',
          latitude: null,
          longitude: null,
        },
        arrivalLocation: {
          address: 'Lyon Part-Dieu',
          latitude: undefined,
          longitude: undefined,
        },
      };

      const item = { id: 'item-2', tripId } as Partial<ItineraryItem> as ItineraryItem;
      const transport = { id: 'transport-1', itemId: 'item-2' } as Partial<Transport> as Transport;

      mockItineraryService.createTransport.mockResolvedValue({ item, transport });

      const result = await controller.createTransport(tripId, dtoWithoutCoords);

      expect(result).toEqual({ item, transport });
      expect(service.createTransport).toHaveBeenCalledWith({
        ...dtoWithoutCoords,
        tripId,
        startDate: new Date(dtoWithoutCoords.startDate),
        endDate: new Date(dtoWithoutCoords.endDate),
        departureLocation: {
          ...dtoWithoutCoords.departureLocation,
          latitude: 0,
          longitude: 0,
        },
        arrivalLocation: {
          ...dtoWithoutCoords.arrivalLocation,
          latitude: 0,
          longitude: 0,
        },
      });
    });

    it('should throw BadRequestException on validation error', async () => {
      mockItineraryService.createTransport.mockRejectedValue(
        new BadRequestException('Transport type is required'),
      );

      await expect(controller.createTransport(tripId, createTransportDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createAccommodation', () => {
    const tripId = 'trip-1';
    const createAccommodationDto: CreateAccommodationDto = {
      title: 'Hotel in Paris',
      startDate: '2024-06-01T15:00:00Z',
      endDate: '2024-06-05T11:00:00Z',
      notes: 'Room with a view',
      orderIndex: 2,
      name: 'Grand Hotel Paris',
      location: {
        address: '123 Champs-Élysées',
        city: 'Paris',
        country: 'France',
        latitude: 48.8698,
        longitude: 2.3079,
      },
      confirmationNumber: 'HTL789',
      phoneNumber: '+33 1 23 45 67 89',
    };

    it('should create an accommodation with coordinates', async () => {
      const item = { id: 'item-3', tripId } as Partial<ItineraryItem> as ItineraryItem;
      const accommodation = { id: 'acc-1', itemId: 'item-3' } as Partial<Accommodation> as Accommodation;

      mockItineraryService.createAccommodation.mockResolvedValue({ item, accommodation });

      const result = await controller.createAccommodation(tripId, createAccommodationDto);

      expect(result).toEqual({ item, accommodation });
      expect(service.createAccommodation).toHaveBeenCalledWith({
        ...createAccommodationDto,
        tripId,
        startDate: new Date(createAccommodationDto.startDate),
        endDate: new Date(createAccommodationDto.endDate),
        location: {
          ...createAccommodationDto.location,
          latitude: 48.8698,
          longitude: 2.3079,
        },
      });
    });

    it('should create an accommodation with default coordinates when missing', async () => {
      const dtoWithoutCoords: CreateAccommodationDto = {
        ...createAccommodationDto,
        location: {
          address: '123 Champs-Élysées',
          latitude: null,
          longitude: null,
        },
      };

      const item = { id: 'item-3', tripId } as Partial<ItineraryItem> as ItineraryItem;
      const accommodation = { id: 'acc-1', itemId: 'item-3' } as Partial<Accommodation> as Accommodation;

      mockItineraryService.createAccommodation.mockResolvedValue({ item, accommodation });

      const result = await controller.createAccommodation(tripId, dtoWithoutCoords);

      expect(result).toEqual({ item, accommodation });
      expect(service.createAccommodation).toHaveBeenCalledWith({
        ...dtoWithoutCoords,
        tripId,
        startDate: new Date(dtoWithoutCoords.startDate),
        endDate: new Date(dtoWithoutCoords.endDate),
        location: {
          ...dtoWithoutCoords.location,
          latitude: 0,
          longitude: 0,
        },
      });
    });

    it('should throw BadRequestException on validation error', async () => {
      mockItineraryService.createAccommodation.mockRejectedValue(
        new BadRequestException('Accommodation name is required'),
      );

      await expect(
        controller.createAccommodation(tripId, createAccommodationDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const itemId = 'item-1';
    const updateDto: UpdateItineraryItemDto = {
      title: 'Updated Flight',
      startDate: '2024-06-02T10:00:00Z',
      endDate: '2024-06-02T13:00:00Z',
      notes: 'Updated notes',
      orderIndex: 1,
    };

    it('should update an itinerary item', async () => {
      const updatedItem = {
        id: itemId,
        ...updateDto,
        startDate: new Date(updateDto.startDate!),
        endDate: new Date(updateDto.endDate!),
      } as Partial<ItineraryItem> as ItineraryItem;

      mockItineraryService.update.mockResolvedValue(updatedItem);

      const result = await controller.update(itemId, updateDto);

      expect(result).toEqual(updatedItem);
      expect(service.update).toHaveBeenCalledWith(itemId, {
        ...updateDto,
        startDate: new Date(updateDto.startDate!),
        endDate: new Date(updateDto.endDate!),
      });
    });

    it('should update with partial data (no dates)', async () => {
      const partialDto: UpdateItineraryItemDto = {
        title: 'Updated Title Only',
        notes: 'New notes',
      };

      const updatedItem = {
        id: itemId,
        ...partialDto,
      } as Partial<ItineraryItem> as ItineraryItem;

      mockItineraryService.update.mockResolvedValue(updatedItem);

      const result = await controller.update(itemId, partialDto);

      expect(result).toEqual(updatedItem);
      expect(service.update).toHaveBeenCalledWith(itemId, partialDto);
    });

    it('should throw NotFoundException if item not found', async () => {
      mockItineraryService.update.mockRejectedValue(
        new NotFoundException('Itinerary item not found'),
      );

      await expect(controller.update(itemId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on validation error', async () => {
      mockItineraryService.update.mockRejectedValue(
        new BadRequestException('End date must be after start date'),
      );

      await expect(controller.update(itemId, updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    const itemId = 'item-1';

    it('should remove an itinerary item', async () => {
      mockItineraryService.remove.mockResolvedValue(undefined);

      await controller.remove(itemId);

      expect(service.remove).toHaveBeenCalledWith(itemId);
    });

    it('should throw NotFoundException if item not found', async () => {
      mockItineraryService.remove.mockRejectedValue(
        new NotFoundException('Itinerary item not found'),
      );

      await expect(controller.remove(itemId)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(itemId);
    });
  });

  describe('reorder', () => {
    const reorderDto: ReorderItemsDto = {
      items: [
        { id: 'item-1', orderIndex: 2 },
        { id: 'item-2', orderIndex: 0 },
        { id: 'item-3', orderIndex: 1 },
      ],
    };

    it('should reorder itinerary items', async () => {
      mockItineraryService.reorder.mockResolvedValue(undefined);

      await controller.reorder(reorderDto);

      expect(service.reorder).toHaveBeenCalledWith(reorderDto.items);
    });

    it('should throw NotFoundException if item not found', async () => {
      mockItineraryService.reorder.mockRejectedValue(
        new NotFoundException('Itinerary item item-4 not found'),
      );

      await expect(controller.reorder(reorderDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on validation error', async () => {
      mockItineraryService.reorder.mockRejectedValue(
        new BadRequestException('Order index must be non-negative'),
      );

      await expect(controller.reorder(reorderDto)).rejects.toThrow(BadRequestException);
    });
  });
});
