import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ItineraryRepository, CreateFlightData, CreateTransportData, CreateAccommodationData } from './itinerary.repository';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { Flight } from './entities/flight.entity';
import { Transport } from './entities/transport.entity';
import { Accommodation } from './entities/accommodation.entity';

/**
 * Service for managing itinerary items with business logic and validation
 */
@Injectable()
export class ItineraryService {
  constructor(private readonly itineraryRepository: ItineraryRepository) {}

  /**
   * Find all itinerary items for a trip, sorted chronologically
   * @param tripId - Trip ID
   * @returns Promise<ItineraryItem[]> - Items sorted by startDate and orderIndex
   */
  async findByTripId(tripId: string): Promise<ItineraryItem[]> {
    return this.itineraryRepository.findByTripId(tripId);
  }

  /**
   * Find a single itinerary item by ID with type checking
   * @param id - Itinerary item ID
   * @returns Promise<ItineraryItem>
   * @throws NotFoundException if item not found
   */
  async findOne(id: string): Promise<ItineraryItem> {
    const item = await this.itineraryRepository.findById(id);
    
    if (!item) {
      throw new NotFoundException(`Itinerary item with ID "${id}" not found`);
    }

    return item;
  }

  /**
   * Create a flight itinerary item with validation
   * @param data - Flight creation data
   * @returns Promise<{ item: ItineraryItem; flight: Flight }>
   * @throws BadRequestException if validation fails
   */
  async createFlight(data: Omit<CreateFlightData, 'duration'>): Promise<{ item: ItineraryItem; flight: Flight }> {
    // Validate dates
    this.validateDateRange(data.startDate, data.endDate, 'departure', 'arrival');

    // Calculate duration in minutes
    const duration = this.calculateDuration(data.startDate, data.endDate);

    // Validate locations
    this.validateLocation(data.departureLocation, 'Departure');
    this.validateLocation(data.arrivalLocation, 'Arrival');

    // Ensure locations are different
    if (this.areLocationsSame(data.departureLocation, data.arrivalLocation)) {
      throw new BadRequestException('Departure and arrival locations must be different');
    }

    // Create flight with calculated duration
    return this.itineraryRepository.createFlight({
      ...data,
      duration,
    });
  }

  /**
   * Create a transport itinerary item with validation
   * @param data - Transport creation data
   * @returns Promise<{ item: ItineraryItem; transport: Transport }>
   * @throws BadRequestException if validation fails
   */
  async createTransport(data: Omit<CreateTransportData, 'duration'>): Promise<{ item: ItineraryItem; transport: Transport }> {
    // Validate dates
    this.validateDateRange(data.startDate, data.endDate, 'departure', 'arrival');

    // Calculate duration in minutes
    const duration = this.calculateDuration(data.startDate, data.endDate);

    // Validate locations
    this.validateLocation(data.departureLocation, 'Departure');
    this.validateLocation(data.arrivalLocation, 'Arrival');

    // Validate transport type
    if (!data.transportType || data.transportType.trim().length === 0) {
      throw new BadRequestException('Transport type is required');
    }

    // Create transport with calculated duration
    return this.itineraryRepository.createTransport({
      ...data,
      duration,
    });
  }

  /**
   * Create an accommodation itinerary item with validation
   * @param data - Accommodation creation data
   * @returns Promise<{ item: ItineraryItem; accommodation: Accommodation }>
   * @throws BadRequestException if validation fails
   */
  async createAccommodation(data: Omit<CreateAccommodationData, 'duration'>): Promise<{ item: ItineraryItem; accommodation: Accommodation }> {
    // Validate dates
    this.validateDateRange(data.startDate, data.endDate, 'check-in', 'check-out');

    // Calculate duration in minutes
    const duration = this.calculateDuration(data.startDate, data.endDate);

    // Validate location
    this.validateLocation(data.location, 'Accommodation');

    // Validate accommodation name
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestException('Accommodation name is required');
    }

    // Create accommodation with calculated duration
    return this.itineraryRepository.createAccommodation({
      ...data,
      duration,
    });
  }

  /**
   * Update an itinerary item with type validation
   * @param id - Itinerary item ID
   * @param data - Partial item data to update
   * @returns Promise<ItineraryItem>
   * @throws NotFoundException if item not found
   * @throws BadRequestException if validation fails
   */
  async update(
    id: string,
    data: Partial<Pick<ItineraryItem, 'title' | 'startDate' | 'endDate' | 'notes' | 'orderIndex'>>,
  ): Promise<ItineraryItem> {
    // Check if item exists
    const existingItem = await this.itineraryRepository.findById(id);
    if (!existingItem) {
      throw new NotFoundException(`Itinerary item with ID "${id}" not found`);
    }

    // Validate date range if both dates are being updated or one is being changed
    if (data.startDate || data.endDate) {
      const startDate = data.startDate || existingItem.startDate;
      const endDate = data.endDate || existingItem.endDate;
      
      this.validateDateRange(startDate, endDate, 'start', 'end');
    }

    // Update the item
    const updatedItem = await this.itineraryRepository.update(id, data);
    
    if (!updatedItem) {
      throw new NotFoundException(`Failed to update itinerary item with ID "${id}"`);
    }

    return updatedItem;
  }

  /**
   * Remove an itinerary item
   * @param id - Itinerary item ID
   * @returns Promise<void>
   * @throws NotFoundException if item not found
   */
  async remove(id: string): Promise<void> {
    // Check if item exists
    const exists = await this.itineraryRepository.exists(id);
    if (!exists) {
      throw new NotFoundException(`Itinerary item with ID "${id}" not found`);
    }

    // Delete the item (CASCADE will delete specific type data)
    const deleted = await this.itineraryRepository.delete(id);
    
    if (!deleted) {
      throw new BadRequestException(`Failed to delete itinerary item with ID "${id}"`);
    }
  }

  /**
   * Reorder itinerary items for drag-drop updates
   * Updates orderIndex for multiple items and refreshes timestamps
   * @param updates - Array of { id, orderIndex } objects
   * @returns Promise<void>
   * @throws BadRequestException if validation fails
   */
  async reorder(updates: Array<{ id: string; orderIndex: number }>): Promise<void> {
    // Validate all items exist
    for (const update of updates) {
      const exists = await this.itineraryRepository.exists(update.id);
      if (!exists) {
        throw new NotFoundException(`Itinerary item with ID "${update.id}" not found`);
      }

      // Validate orderIndex is non-negative
      if (update.orderIndex < 0) {
        throw new BadRequestException(`Order index must be non-negative, got ${update.orderIndex}`);
      }
    }

    // Perform the reorder
    await this.itineraryRepository.reorder(updates);
  }

  /**
   * Count itinerary items for a trip
   * @param tripId - Trip ID
   * @returns Promise<number>
   */
  async count(tripId: string): Promise<number> {
    return this.itineraryRepository.countByTripId(tripId);
  }

  /**
   * Check if an itinerary item exists
   * @param id - Itinerary item ID
   * @returns Promise<boolean>
   */
  async exists(id: string): Promise<boolean> {
    return this.itineraryRepository.exists(id);
  }

  /**
   * Validate that end date is after start date
   * @param startDate - Start date
   * @param endDate - End date
   * @param startLabel - Label for start date in error message
   * @param endLabel - Label for end date in error message
   * @throws BadRequestException if validation fails
   */
  private validateDateRange(
    startDate: Date,
    endDate: Date,
    startLabel: string,
    endLabel: string,
  ): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      throw new BadRequestException(`Invalid ${startLabel} date`);
    }

    if (isNaN(end.getTime())) {
      throw new BadRequestException(`Invalid ${endLabel} date`);
    }

    if (end <= start) {
      throw new BadRequestException(
        `${endLabel.charAt(0).toUpperCase() + endLabel.slice(1)} date must be after ${startLabel} date`,
      );
    }
  }

  /**
   * Calculate duration between two dates in minutes
   * @param startDate - Start date
   * @param endDate - End date
   * @returns number - Duration in minutes
   */
  private calculateDuration(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const durationMs = end.getTime() - start.getTime();
    return Math.floor(durationMs / (1000 * 60)); // Convert to minutes
  }

  /**
   * Validate location object has required fields
   * @param location - Location object
   * @param label - Label for error message
   * @throws BadRequestException if validation fails
   */
  private validateLocation(location: any, label: string): void {
    if (!location) {
      throw new BadRequestException(`${label} location is required`);
    }

    if (!location.address || location.address.trim().length === 0) {
      throw new BadRequestException(`${label} location must have an address`);
    }

    // Validate coordinates if provided
    if (location.latitude !== undefined || location.longitude !== undefined) {
      if (typeof location.latitude !== 'number' || 
          typeof location.longitude !== 'number' ||
          location.latitude < -90 || location.latitude > 90 ||
          location.longitude < -180 || location.longitude > 180) {
        throw new BadRequestException(`${label} location has invalid coordinates`);
      }
    }
  }

  /**
   * Check if two locations are the same based on address
   * @param loc1 - First location
   * @param loc2 - Second location
   * @returns boolean - true if same, false otherwise
   */
  private areLocationsSame(loc1: any, loc2: any): boolean {
    if (!loc1 || !loc2) {
      return false;
    }

    // Compare addresses (case-insensitive, trimmed)
    const addr1 = (loc1.address || '').trim().toLowerCase();
    const addr2 = (loc2.address || '').trim().toLowerCase();

    return addr1 === addr2 && addr1.length > 0;
  }
}
