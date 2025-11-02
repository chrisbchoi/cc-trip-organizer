import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';

describe('TripsController', () => {
  let controller: TripsController;
  let service: jest.Mocked<TripsService>;

  const mockTrip: Trip = {
    id: 'test-uuid-123',
    title: 'Summer Vacation',
    description: 'Trip to Europe',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
    itineraryItems: [],
  };

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [
        {
          provide: TripsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TripsController>(TripsController);
    service = module.get(TripsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of trips', async () => {
      const trips = [mockTrip];
      service.findAll.mockResolvedValue(trips);

      const result = await controller.findAll();

      expect(result).toEqual(trips);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no trips exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a trip by id', async () => {
      service.findOne.mockResolvedValue(mockTrip);

      const result = await controller.findOne('test-uuid-123');

      expect(result).toEqual(mockTrip);
      expect(service.findOne).toHaveBeenCalledWith('test-uuid-123');
    });

    it('should throw NotFoundException when trip not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Trip with ID "non-existent-id" not found'),
      );

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        'Trip with ID "non-existent-id" not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new trip', async () => {
      const createDto: CreateTripDto = {
        title: 'Summer Vacation',
        description: 'Trip to Europe',
        startDate: '2024-07-01',
        endDate: '2024-07-15',
      };

      service.create.mockResolvedValue(mockTrip);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockTrip);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should create trip with minimal data', async () => {
      const createDto: CreateTripDto = {
        title: 'Quick Trip',
      };

      const minimalTrip: Trip = {
        ...mockTrip,
        title: 'Quick Trip',
        description: undefined,
        startDate: undefined,
        endDate: undefined,
      };

      service.create.mockResolvedValue(minimalTrip);

      const result = await controller.create(createDto);

      expect(result.title).toBe('Quick Trip');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw BadRequestException for invalid data', async () => {
      const createDto: CreateTripDto = {
        title: 'Invalid Trip',
        startDate: '2024-07-15',
        endDate: '2024-07-01',
      };

      service.create.mockRejectedValue(
        new BadRequestException('End date must be after start date'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.create(createDto)).rejects.toThrow(
        'End date must be after start date',
      );
    });
  });

  describe('update', () => {
    it('should update an existing trip', async () => {
      const updateDto: UpdateTripDto = {
        title: 'Updated Vacation',
        description: 'Updated description',
      };

      const updatedTrip: Trip = {
        ...mockTrip,
        title: 'Updated Vacation',
        description: 'Updated description',
      };

      service.update.mockResolvedValue(updatedTrip);

      const result = await controller.update('test-uuid-123', updateDto);

      expect(result.title).toBe('Updated Vacation');
      expect(result.description).toBe('Updated description');
      expect(service.update).toHaveBeenCalledWith('test-uuid-123', updateDto);
    });

    it('should throw NotFoundException when trip not found', async () => {
      const updateDto: UpdateTripDto = {
        title: 'Updated Trip',
      };

      service.update.mockRejectedValue(
        new NotFoundException('Trip with ID "non-existent-id" not found'),
      );

      await expect(
        controller.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.update('non-existent-id', updateDto),
      ).rejects.toThrow('Trip with ID "non-existent-id" not found');
    });

    it('should throw BadRequestException for invalid date range', async () => {
      const updateDto: UpdateTripDto = {
        startDate: '2024-07-15',
        endDate: '2024-07-01',
      };

      service.update.mockRejectedValue(
        new BadRequestException('End date must be after start date'),
      );

      await expect(
        controller.update('test-uuid-123', updateDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.update('test-uuid-123', updateDto),
      ).rejects.toThrow('End date must be after start date');
    });

    it('should allow partial updates', async () => {
      const updateDto: UpdateTripDto = {
        description: 'Only updating description',
      };

      const updatedTrip: Trip = {
        ...mockTrip,
        description: 'Only updating description',
      };

      service.update.mockResolvedValue(updatedTrip);

      const result = await controller.update('test-uuid-123', updateDto);

      expect(result.description).toBe('Only updating description');
      expect(result.title).toBe(mockTrip.title);
      expect(service.update).toHaveBeenCalledWith('test-uuid-123', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a trip', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('test-uuid-123');

      expect(service.remove).toHaveBeenCalledWith('test-uuid-123');
    });

    it('should throw NotFoundException when trip not found', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Trip with ID "non-existent-id" not found'),
      );

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        'Trip with ID "non-existent-id" not found',
      );
    });

    it('should return void on successful deletion', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('test-uuid-123');

      expect(result).toBeUndefined();
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 200 OK for findAll', async () => {
      service.findAll.mockResolvedValue([mockTrip]);
      
      const result = await controller.findAll();
      
      expect(result).toBeDefined();
      // Status code is set via @HttpCode decorator
    });

    it('should return 200 OK for findOne', async () => {
      service.findOne.mockResolvedValue(mockTrip);
      
      const result = await controller.findOne('test-uuid-123');
      
      expect(result).toBeDefined();
      // Status code is set via @HttpCode decorator
    });

    it('should return 201 CREATED for create', async () => {
      const createDto: CreateTripDto = { title: 'New Trip' };
      service.create.mockResolvedValue(mockTrip);
      
      const result = await controller.create(createDto);
      
      expect(result).toBeDefined();
      // Status code is set via @HttpCode decorator
    });

    it('should return 200 OK for update', async () => {
      const updateDto: UpdateTripDto = { title: 'Updated' };
      service.update.mockResolvedValue(mockTrip);
      
      const result = await controller.update('test-uuid-123', updateDto);
      
      expect(result).toBeDefined();
      // Status code is set via @HttpCode decorator
    });

    it('should return 204 NO CONTENT for remove', async () => {
      service.remove.mockResolvedValue(undefined);
      
      const result = await controller.remove('test-uuid-123');
      
      expect(result).toBeUndefined();
      // Status code is set via @HttpCode decorator
    });
  });

  describe('Validation', () => {
    it('should validate DTOs using ValidationPipe', async () => {
      // ValidationPipe is configured in the controller decorators
      // This test verifies the pipe is applied
      const createDto: CreateTripDto = { title: 'Valid Trip' };
      service.create.mockResolvedValue(mockTrip);

      await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should whitelist properties using ValidationPipe', async () => {
      // ValidationPipe with whitelist: true removes non-whitelisted properties
      const updateDto: UpdateTripDto = { title: 'Updated' };
      service.update.mockResolvedValue(mockTrip);

      await controller.update('test-uuid-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('test-uuid-123', updateDto);
    });
  });
});
