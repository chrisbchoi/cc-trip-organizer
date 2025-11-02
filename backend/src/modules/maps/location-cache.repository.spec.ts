import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationCacheRepository } from './location-cache.repository';
import { LocationCache } from './entities/location-cache.entity';

describe('LocationCacheRepository', () => {
  let repository: LocationCacheRepository;
  let typeormRepository: jest.Mocked<Repository<LocationCache>>;

  const mockLocationCache: LocationCache = {
    id: 'test-id-1',
    address: '1600 Amphitheatre Parkway, Mountain View, CA',
    formattedAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
    latitude: 37.4224764,
    longitude: -122.0842499,
    city: 'Mountain View',
    country: 'United States',
    placeId: 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        delete: jest.fn().mockReturnThis(),
        execute: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationCacheRepository,
        {
          provide: getRepositoryToken(LocationCache),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<LocationCacheRepository>(LocationCacheRepository);
    typeormRepository = module.get(getRepositoryToken(LocationCache));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByAddress', () => {
    it('should find location by exact address match (case-insensitive)', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockLocationCache),
      };
      typeormRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await repository.findByAddress('1600 Amphitheatre Parkway');

      expect(result).toEqual(mockLocationCache);
      expect(typeormRepository.createQueryBuilder).toHaveBeenCalledWith('cache');
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'LOWER(cache.address) = :address',
        { address: '1600 amphitheatre parkway' },
      );
    });

    it('should normalize address (trim and lowercase)', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockLocationCache),
      };
      typeormRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await repository.findByAddress('  1600 AMPHITHEATRE PARKWAY  ');

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'LOWER(cache.address) = :address',
        { address: '1600 amphitheatre parkway' },
      );
    });

    it('should return null when address not found', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      typeormRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await repository.findByAddress('nonexistent address');

      expect(result).toBeNull();
    });
  });

  describe('findByPlaceId', () => {
    it('should find location by place ID', async () => {
      typeormRepository.findOne.mockResolvedValue(mockLocationCache);

      const result = await repository.findByPlaceId(mockLocationCache.placeId!);

      expect(result).toEqual(mockLocationCache);
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { placeId: mockLocationCache.placeId },
      });
    });

    it('should return null when place ID not found', async () => {
      typeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByPlaceId('invalid-place-id');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find location by ID', async () => {
      typeormRepository.findOne.mockResolvedValue(mockLocationCache);

      const result = await repository.findById('test-id-1');

      expect(result).toEqual(mockLocationCache);
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
    });
  });

  describe('create', () => {
    it('should create a new location cache entry', async () => {
      const newLocation = {
        address: 'Test Address',
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York',
        country: 'USA',
      };

      typeormRepository.create.mockReturnValue({
        ...newLocation,
        id: 'generated-id',
      } as any);

      typeormRepository.save.mockResolvedValue({
        ...newLocation,
        id: 'generated-id',
        createdAt: new Date(),
      } as any);

      const result = await repository.create(newLocation);

      expect(result.address).toBe(newLocation.address);
      expect(typeormRepository.create).toHaveBeenCalled();
      expect(typeormRepository.save).toHaveBeenCalled();
    });

    it('should generate UUID for new entries', async () => {
      typeormRepository.create.mockImplementation((data) => data as any);
      typeormRepository.save.mockResolvedValue(mockLocationCache);

      await repository.create({
        address: 'Test',
        latitude: 0,
        longitude: 0,
      });

      const createCall = typeormRepository.create.mock.calls[0][0] as any;
      expect(createCall.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe('update', () => {
    it('should update existing location', async () => {
      typeormRepository.findOne.mockResolvedValue(mockLocationCache);
      typeormRepository.save.mockResolvedValue({
        ...mockLocationCache,
        city: 'Updated City',
      });

      const result = await repository.update('test-id-1', {
        city: 'Updated City',
      });

      expect(result?.city).toBe('Updated City');
      expect(typeormRepository.save).toHaveBeenCalled();
    });

    it('should return null when location not found', async () => {
      typeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.update('nonexistent-id', {
        city: 'Test',
      });

      expect(result).toBeNull();
      expect(typeormRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete location and return true', async () => {
      typeormRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await repository.delete('test-id-1');

      expect(result).toBe(true);
      expect(typeormRepository.delete).toHaveBeenCalledWith('test-id-1');
    });

    it('should return false when location not found', async () => {
      typeormRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      const result = await repository.delete('nonexistent-id');

      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all locations with default limit', async () => {
      const mockLocations = [mockLocationCache];
      typeormRepository.find.mockResolvedValue(mockLocations);

      const result = await repository.findAll();

      expect(result).toEqual(mockLocations);
      expect(typeormRepository.find).toHaveBeenCalledWith({
        take: 100,
        order: { createdAt: 'DESC' },
      });
    });

    it('should respect custom limit', async () => {
      typeormRepository.find.mockResolvedValue([]);

      await repository.findAll(50);

      expect(typeormRepository.find).toHaveBeenCalledWith({
        take: 50,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('searchByAddress', () => {
    it('should search locations by partial address match', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockLocationCache]),
      };
      typeormRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await repository.searchByAddress('Amphitheatre', 10);

      expect(result).toEqual([mockLocationCache]);
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should normalize search term', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      typeormRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await repository.searchByAddress('  TEST  ');

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'LOWER(cache.address) LIKE :search',
        { search: '%test%' },
      );
    });
  });

  describe('count', () => {
    it('should return total count of cached locations', async () => {
      typeormRepository.count.mockResolvedValue(42);

      const result = await repository.count();

      expect(result).toBe(42);
      expect(typeormRepository.count).toHaveBeenCalled();
    });
  });

  describe('deleteOldEntries', () => {
    it('should delete entries older than specified days', async () => {
      const queryBuilder: any = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      };
      typeormRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await repository.deleteOldEntries(90);

      expect(result).toBe(5);
      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalled();
    });

    it('should use default of 90 days', async () => {
      const queryBuilder: any = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };
      typeormRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await repository.deleteOldEntries();

      expect(queryBuilder.where).toHaveBeenCalled();
    });
  });
});
