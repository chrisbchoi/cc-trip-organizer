import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripsRepository } from './trips.repository';
import { Trip } from './entities/trip.entity';

describe('TripsRepository', () => {
  let tripsRepository: TripsRepository;
  let mockRepository: Partial<Repository<Trip>>;

  const mockTrip: Trip = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Trip',
    description: 'Test Description',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-07'),
    createdAt: new Date(),
    updatedAt: new Date(),
    itineraryItems: [],
  };

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsRepository,
        {
          provide: getRepositoryToken(Trip),
          useValue: mockRepository,
        },
      ],
    }).compile();

    tripsRepository = module.get<TripsRepository>(TripsRepository);
  });

  it('should be defined', () => {
    expect(tripsRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of trips', async () => {
      const trips = [mockTrip];
      jest.spyOn(mockRepository, 'find').mockResolvedValue(trips);

      const result = await tripsRepository.findAll();

      expect(result).toEqual(trips);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findById', () => {
    it('should return a trip by id', async () => {
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(mockTrip);

      const result = await tripsRepository.findById(mockTrip.id);

      expect(result).toEqual(mockTrip);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTrip.id },
        relations: ['itineraryItems'],
      });
    });

    it('should return null if trip not found', async () => {
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(null);

      const result = await tripsRepository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new trip', async () => {
      const tripData = {
        title: 'New Trip',
        description: 'New Description',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-07'),
      };

      jest.spyOn(mockRepository, 'create').mockReturnValue(mockTrip);
      jest.spyOn(mockRepository, 'save').mockResolvedValue(mockTrip);

      const result = await tripsRepository.create(tripData);

      expect(result).toEqual(mockTrip);
      expect(mockRepository.create).toHaveBeenCalledWith(tripData);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTrip);
    });
  });

  describe('update', () => {
    it('should update and return the trip', async () => {
      const updateData = { title: 'Updated Trip' };
      jest.spyOn(mockRepository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue({ ...mockTrip, ...updateData });

      const result = await tripsRepository.update(mockTrip.id, updateData);

      expect(result).toEqual({ ...mockTrip, ...updateData });
      expect(mockRepository.update).toHaveBeenCalledWith(mockTrip.id, updateData);
    });

    it('should return null if trip not found', async () => {
      jest.spyOn(mockRepository, 'update').mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(null);

      const result = await tripsRepository.update('non-existent-id', { title: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a trip and return true', async () => {
      jest.spyOn(mockRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await tripsRepository.delete(mockTrip.id);

      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(mockTrip.id);
    });

    it('should return false if trip not found', async () => {
      jest.spyOn(mockRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

      const result = await tripsRepository.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return the count of trips', async () => {
      jest.spyOn(mockRepository, 'count').mockResolvedValue(5);

      const result = await tripsRepository.count();

      expect(result).toBe(5);
      expect(mockRepository.count).toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('should return true if trip exists', async () => {
      jest.spyOn(mockRepository, 'count').mockResolvedValue(1);

      const result = await tripsRepository.exists(mockTrip.id);

      expect(result).toBe(true);
      expect(mockRepository.count).toHaveBeenCalledWith({ where: { id: mockTrip.id } });
    });

    it('should return false if trip does not exist', async () => {
      jest.spyOn(mockRepository, 'count').mockResolvedValue(0);

      const result = await tripsRepository.exists('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
