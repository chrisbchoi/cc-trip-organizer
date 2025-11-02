import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';

@Injectable()
export class TripsRepository {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  /**
   * Find all trips
   * @returns Promise<Trip[]>
   */
  async findAll(): Promise<Trip[]> {
    return this.tripRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Find a trip by ID
   * @param id - Trip ID
   * @returns Promise<Trip | null>
   */
  async findById(id: string): Promise<Trip | null> {
    return this.tripRepository.findOne({
      where: { id },
      relations: ['itineraryItems'],
    });
  }

  /**
   * Create a new trip
   * @param tripData - Partial trip data
   * @returns Promise<Trip>
   */
  async create(tripData: Partial<Trip>): Promise<Trip> {
    const trip = this.tripRepository.create(tripData);
    return this.tripRepository.save(trip);
  }

  /**
   * Update an existing trip
   * @param id - Trip ID
   * @param tripData - Partial trip data to update
   * @returns Promise<Trip | null>
   */
  async update(id: string, tripData: Partial<Trip>): Promise<Trip | null> {
    await this.tripRepository.update(id, tripData);
    return this.findById(id);
  }

  /**
   * Delete a trip by ID
   * @param id - Trip ID
   * @returns Promise<boolean> - true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.tripRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Count total trips
   * @returns Promise<number>
   */
  async count(): Promise<number> {
    return this.tripRepository.count();
  }

  /**
   * Check if a trip exists
   * @param id - Trip ID
   * @returns Promise<boolean>
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.tripRepository.count({ where: { id } });
    return count > 0;
  }
}
