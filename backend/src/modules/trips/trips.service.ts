import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TripsRepository } from './trips.repository';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing trip business logic
 */
@Injectable()
export class TripsService {
  constructor(private readonly tripsRepository: TripsRepository) {}

  /**
   * Get all trips
   * @returns Array of all trips
   */
  async findAll(): Promise<Trip[]> {
    return this.tripsRepository.findAll();
  }

  /**
   * Get a trip by ID
   * @param id - Trip ID
   * @returns Trip if found
   * @throws NotFoundException if trip doesn't exist
   */
  async findOne(id: string): Promise<Trip> {
    const trip = await this.tripsRepository.findById(id);
    
    if (!trip) {
      throw new NotFoundException(`Trip with ID "${id}" not found`);
    }
    
    return trip;
  }

  /**
   * Create a new trip
   * @param createTripDto - Trip data
   * @returns Created trip
   * @throws BadRequestException if validation fails
   */
  async create(createTripDto: CreateTripDto): Promise<Trip> {
    // Validate date range if both dates provided
    if (createTripDto.startDate && createTripDto.endDate) {
      const startDate = new Date(createTripDto.startDate);
      const endDate = new Date(createTripDto.endDate);
      
      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Generate UUID for new trip
    const id = uuidv4();

    // Prepare trip data with dates converted
    const tripData: Partial<Trip> = {
      id,
      title: createTripDto.title,
      description: createTripDto.description,
      startDate: createTripDto.startDate ? new Date(createTripDto.startDate) : undefined,
      endDate: createTripDto.endDate ? new Date(createTripDto.endDate) : undefined,
    };

    return this.tripsRepository.create(tripData);
  }

  /**
   * Update an existing trip
   * @param id - Trip ID
   * @param updateTripDto - Updated trip data
   * @returns Updated trip
   * @throws NotFoundException if trip doesn't exist
   * @throws BadRequestException if validation fails
   */
  async update(id: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    // Check if trip exists
    const existingTrip = await this.tripsRepository.findById(id);
    if (!existingTrip) {
      throw new NotFoundException(`Trip with ID "${id}" not found`);
    }

    // Validate date range if both dates provided
    const startDate = updateTripDto.startDate 
      ? new Date(updateTripDto.startDate) 
      : existingTrip.startDate;
    const endDate = updateTripDto.endDate 
      ? new Date(updateTripDto.endDate) 
      : existingTrip.endDate;

    if (startDate && endDate && endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Prepare update data with dates converted
    const updateData: Partial<Trip> = {
      ...updateTripDto,
      startDate: updateTripDto.startDate ? new Date(updateTripDto.startDate) : undefined,
      endDate: updateTripDto.endDate ? new Date(updateTripDto.endDate) : undefined,
    };

    const updatedTrip = await this.tripsRepository.update(id, updateData);
    
    if (!updatedTrip) {
      throw new NotFoundException(`Trip with ID "${id}" not found`);
    }

    return updatedTrip;
  }

  /**
   * Delete a trip
   * @param id - Trip ID
   * @returns void
   * @throws NotFoundException if trip doesn't exist
   * @description Deletes trip and cascades to all itinerary items
   */
  async remove(id: string): Promise<void> {
    // Check if trip exists
    const existingTrip = await this.tripsRepository.findById(id);
    if (!existingTrip) {
      throw new NotFoundException(`Trip with ID "${id}" not found`);
    }

    const deleted = await this.tripsRepository.delete(id);
    
    if (!deleted) {
      throw new NotFoundException(`Trip with ID "${id}" not found`);
    }
  }

  /**
   * Get total count of trips
   * @returns Number of trips
   */
  async count(): Promise<number> {
    return this.tripsRepository.count();
  }

  /**
   * Check if a trip exists
   * @param id - Trip ID
   * @returns True if trip exists
   */
  async exists(id: string): Promise<boolean> {
    return this.tripsRepository.exists(id);
  }
}
