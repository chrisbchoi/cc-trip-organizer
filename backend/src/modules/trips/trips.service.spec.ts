import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsRepository } from './trips.repository';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';

describe('TripsService', () => {
  let service: TripsService;
  let repository: jest.Mocked<TripsRepository>;

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
    const mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        {
          provide: TripsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    repository = module.get(TripsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of trips', async () => {
      const trips = [mockTrip];
      repository.findAll.mockResolvedValue(trips);

      const result = await service.findAll();

      expect(result).toEqual(trips);
      expect(repository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no trips exist', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a trip by id', async () => {
      repository.findById.mockResolvedValue(mockTrip);

      const result = await service.findOne('test-uuid-123');

      expect(result).toEqual(mockTrip);
      expect(repository.findById).toHaveBeenCalledWith('test-uuid-123');
    });

    it('should throw NotFoundException when trip not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
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

      repository.create.mockResolvedValue(mockTrip);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTrip);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          title: createDto.title,
          description: createDto.description,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      );
    });

    it('should create trip with only title (minimal data)', async () => {
      const createDto: CreateTripDto = {
        title: 'Quick Trip',
      };

      const minimalTrip = { ...mockTrip, title: 'Quick Trip', description: undefined, startDate: undefined, endDate: undefined };
      repository.create.mockResolvedValue(minimalTrip);

      const result = await service.create(createDto);

      expect(result.title).toBe('Quick Trip');
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when end date is before start date', async () => {
      const createDto: CreateTripDto = {
        title: 'Invalid Trip',
        startDate: '2024-07-15',
        endDate: '2024-07-01', // Before start date
      };

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'End date must be after start date',
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when end date equals start date', async () => {
      const createDto: CreateTripDto = {
        title: 'Same Day Trip',
        startDate: '2024-07-01',
        endDate: '2024-07-01', // Same as start date
      };

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should generate UUID for new trip', async () => {
      const createDto: CreateTripDto = {
        title: 'Test Trip',
      };

      repository.create.mockResolvedValue(mockTrip);

      await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update an existing trip', async () => {
      const updateDto: UpdateTripDto = {
        title: 'Updated Vacation',
        description: 'Updated description',
      };

      repository.findById.mockResolvedValue(mockTrip);
      const updatedTrip: Trip = {
        ...mockTrip,
        title: updateDto.title!,
        description: updateDto.description!,
      };
      repository.update.mockResolvedValue(updatedTrip);

      const result = await service.update('test-uuid-123', updateDto);

      expect(result.title).toBe('Updated Vacation');
      expect(repository.findById).toHaveBeenCalledWith('test-uuid-123');
      expect(repository.update).toHaveBeenCalledWith(
        'test-uuid-123',
        expect.objectContaining({
          title: updateDto.title,
          description: updateDto.description,
        }),
      );
    });

    it('should throw NotFoundException when trip not found', async () => {
      const updateDto: UpdateTripDto = { title: 'Updated Trip' };
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when updating with invalid date range', async () => {
      const updateDto: UpdateTripDto = {
        startDate: '2024-07-15',
        endDate: '2024-07-01', // Before start date
      };

      repository.findById.mockResolvedValue(mockTrip);

      await expect(
        service.update('test-uuid-123', updateDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update('test-uuid-123', updateDto),
      ).rejects.toThrow('End date must be after start date');
    });

    it('should validate dates using existing trip data when partially updating', async () => {
      const updateDto: UpdateTripDto = {
        endDate: '2024-06-01', // Before existing start date
      };

      repository.findById.mockResolvedValue(mockTrip); // Has startDate: 2024-07-01

      await expect(
        service.update('test-uuid-123', updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow updating only start date if valid', async () => {
      const updateDto: UpdateTripDto = {
        startDate: '2024-07-05', // Still before endDate: 2024-07-15
      };

      repository.findById.mockResolvedValue(mockTrip);
      repository.update.mockResolvedValue({ ...mockTrip, startDate: new Date('2024-07-05') });

      const result = await service.update('test-uuid-123', updateDto);

      expect(result).toBeDefined();
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a trip', async () => {
      repository.findById.mockResolvedValue(mockTrip);
      repository.delete.mockResolvedValue(true);

      await service.remove('test-uuid-123');

      expect(repository.findById).toHaveBeenCalledWith('test-uuid-123');
      expect(repository.delete).toHaveBeenCalledWith('test-uuid-123');
    });

    it('should throw NotFoundException when trip not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Trip with ID "non-existent-id" not found',
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if delete operation fails', async () => {
      repository.findById.mockResolvedValue(mockTrip);
      repository.delete.mockResolvedValue(false);

      await expect(service.remove('test-uuid-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('count', () => {
    it('should return the count of trips', async () => {
      repository.count.mockResolvedValue(5);

      const result = await service.count();

      expect(result).toBe(5);
      expect(repository.count).toHaveBeenCalled();
    });

    it('should return 0 when no trips exist', async () => {
      repository.count.mockResolvedValue(0);

      const result = await service.count();

      expect(result).toBe(0);
    });
  });

  describe('exists', () => {
    it('should return true when trip exists', async () => {
      repository.exists.mockResolvedValue(true);

      const result = await service.exists('test-uuid-123');

      expect(result).toBe(true);
      expect(repository.exists).toHaveBeenCalledWith('test-uuid-123');
    });

    it('should return false when trip does not exist', async () => {
      repository.exists.mockResolvedValue(false);

      const result = await service.exists('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
