import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationCache } from './entities/location-cache.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for managing location cache entries
 * Provides CRUD operations and search functionality for geocoding results
 */
@Injectable()
export class LocationCacheRepository {
  constructor(
    @InjectRepository(LocationCache)
    private readonly repository: Repository<LocationCache>,
  ) {}

  /**
   * Find a cached location by exact address match
   * @param address - The address string to search for
   * @returns Promise<LocationCache | null>
   */
  async findByAddress(address: string): Promise<LocationCache | null> {
    // Normalize address for consistent matching (lowercase, trim)
    const normalizedAddress = address.trim().toLowerCase();
    
    const result = await this.repository
      .createQueryBuilder('cache')
      .where('LOWER(cache.address) = :address', { address: normalizedAddress })
      .getOne();

    return result;
  }

  /**
   * Find a cached location by Google Places ID
   * @param placeId - The Google Places ID
   * @returns Promise<LocationCache | null>
   */
  async findByPlaceId(placeId: string): Promise<LocationCache | null> {
    return this.repository.findOne({
      where: { placeId },
    });
  }

  /**
   * Find a cached location by ID
   * @param id - The cache entry ID
   * @returns Promise<LocationCache | null>
   */
  async findById(id: string): Promise<LocationCache | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Create a new location cache entry
   * @param data - Location cache data
   * @returns Promise<LocationCache>
   */
  async create(data: {
    address: string;
    formattedAddress?: string;
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    placeId?: string;
  }): Promise<LocationCache> {
    const cache = this.repository.create({
      id: uuidv4(),
      ...data,
    });

    return this.repository.save(cache);
  }

  /**
   * Update an existing location cache entry
   * @param id - Cache entry ID
   * @param data - Updated location data
   * @returns Promise<LocationCache | null>
   */
  async update(
    id: string,
    data: Partial<{
      address: string;
      formattedAddress?: string;
      latitude: number;
      longitude: number;
      city?: string;
      country?: string;
      placeId?: string;
    }>,
  ): Promise<LocationCache | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    Object.assign(existing, data);
    return this.repository.save(existing);
  }

  /**
   * Delete a location cache entry
   * @param id - Cache entry ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Find all cached locations (with optional limit for admin purposes)
   * @param limit - Maximum number of results to return
   * @returns Promise<LocationCache[]>
   */
  async findAll(limit = 100): Promise<LocationCache[]> {
    return this.repository.find({
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Search for cached locations by partial address match
   * @param searchTerm - Partial address to search for
   * @param limit - Maximum number of results
   * @returns Promise<LocationCache[]>
   */
  async searchByAddress(
    searchTerm: string,
    limit = 10,
  ): Promise<LocationCache[]> {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return this.repository
      .createQueryBuilder('cache')
      .where('LOWER(cache.address) LIKE :search', {
        search: `%${normalizedSearch}%`,
      })
      .orWhere('LOWER(cache.formatted_address) LIKE :search', {
        search: `%${normalizedSearch}%`,
      })
      .orWhere('LOWER(cache.city) LIKE :search', {
        search: `%${normalizedSearch}%`,
      })
      .take(limit)
      .orderBy('cache.created_at', 'DESC')
      .getMany();
  }

  /**
   * Count total cached locations
   * @returns Promise<number>
   */
  async count(): Promise<number> {
    return this.repository.count();
  }

  /**
   * Delete old cache entries (for maintenance)
   * @param daysOld - Delete entries older than this many days
   * @returns Promise<number> - Number of entries deleted
   */
  async deleteOldEntries(daysOld = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected ?? 0;
  }
}
