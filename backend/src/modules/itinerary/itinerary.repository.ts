import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { Flight } from './entities/flight.entity';
import { Transport } from './entities/transport.entity';
import { Accommodation } from './entities/accommodation.entity';
import { Location } from './types/location.interface';

/**
 * Data structure for creating a flight itinerary item
 */
export interface CreateFlightData {
  tripId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  orderIndex?: number;
  departureLocation: Location;
  arrivalLocation: Location;
  flightNumber?: string;
  airline?: string;
  confirmationCode?: string;
  duration: number;
}

/**
 * Data structure for creating a transport itinerary item
 */
export interface CreateTransportData {
  tripId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  orderIndex?: number;
  transportType: string;
  departureLocation: Location;
  arrivalLocation: Location;
  provider?: string;
  confirmationCode?: string;
  duration: number;
}

/**
 * Data structure for creating an accommodation itinerary item
 */
export interface CreateAccommodationData {
  tripId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  orderIndex?: number;
  name: string;
  location: Location;
  confirmationNumber?: string;
  phoneNumber?: string;
  duration: number;
}

/**
 * Repository for managing itinerary items and their specific types
 */
@Injectable()
export class ItineraryRepository {
  constructor(
    @InjectRepository(ItineraryItem)
    private readonly itineraryItemRepository: Repository<ItineraryItem>,
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    @InjectRepository(Transport)
    private readonly transportRepository: Repository<Transport>,
    @InjectRepository(Accommodation)
    private readonly accommodationRepository: Repository<Accommodation>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find all itinerary items for a trip, sorted by start date
   * @param tripId - Trip ID
   * @returns Promise<ItineraryItem[]>
   */
  async findByTripId(tripId: string): Promise<ItineraryItem[]> {
    return this.itineraryItemRepository.find({
      where: { tripId },
      order: {
        startDate: 'ASC',
        orderIndex: 'ASC',
      },
    });
  }

  /**
   * Find an itinerary item by ID with its specific type relation
   * @param id - Itinerary item ID
   * @returns Promise<ItineraryItem | null>
   */
  async findById(id: string): Promise<ItineraryItem | null> {
    const item = await this.itineraryItemRepository.findOne({
      where: { id },
      relations: ['trip'],
    });

    if (!item) {
      return null;
    }

    // Load the specific type relation based on the type field
    if (item.type === 'flight') {
      const flight = await this.flightRepository.findOne({
        where: { itineraryItemId: id },
      });
      // Attach flight data to item (TypeScript won't know about this, but it's useful)
      (item as any).flight = flight;
    } else if (item.type === 'transport') {
      const transport = await this.transportRepository.findOne({
        where: { itineraryItemId: id },
      });
      (item as any).transport = transport;
    } else if (item.type === 'accommodation') {
      const accommodation = await this.accommodationRepository.findOne({
        where: { itineraryItemId: id },
      });
      (item as any).accommodation = accommodation;
    }

    return item;
  }

  /**
   * Create a new flight itinerary item
   * @param data - Flight creation data
   * @returns Promise<{ item: ItineraryItem; flight: Flight }>
   */
  async createFlight(
    data: CreateFlightData,
  ): Promise<{ item: ItineraryItem; flight: Flight }> {
    return this.dataSource.transaction(async (manager) => {
      // Create the base itinerary item
      const itemId = uuidv4();
      const item = manager.create(ItineraryItem, {
        id: itemId,
        tripId: data.tripId,
        type: 'flight',
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
        orderIndex: data.orderIndex ?? 0,
      });
      await manager.save(ItineraryItem, item);

      // Create the flight-specific data
      const flightId = uuidv4();
      const flight = manager.create(Flight, {
        id: flightId,
        itineraryItemId: itemId,
        flightNumber: data.flightNumber,
        airline: data.airline,
        confirmationCode: data.confirmationCode,
        duration: data.duration,
      });

      // Set locations using the virtual setters
      flight.departureLocation = data.departureLocation;
      flight.arrivalLocation = data.arrivalLocation;

      await manager.save(Flight, flight);

      return { item, flight };
    });
  }

  /**
   * Create a new transport itinerary item
   * @param data - Transport creation data
   * @returns Promise<{ item: ItineraryItem; transport: Transport }>
   */
  async createTransport(
    data: CreateTransportData,
  ): Promise<{ item: ItineraryItem; transport: Transport }> {
    return this.dataSource.transaction(async (manager) => {
      // Create the base itinerary item
      const itemId = uuidv4();
      const item = manager.create(ItineraryItem, {
        id: itemId,
        tripId: data.tripId,
        type: 'transport',
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
        orderIndex: data.orderIndex ?? 0,
      });
      await manager.save(ItineraryItem, item);

      // Create the transport-specific data
      const transportId = uuidv4();
      const transport = manager.create(Transport, {
        id: transportId,
        itineraryItemId: itemId,
        transportType: data.transportType,
        provider: data.provider,
        confirmationCode: data.confirmationCode,
        duration: data.duration,
      });

      // Set locations using the virtual setters
      transport.departureLocation = data.departureLocation;
      transport.arrivalLocation = data.arrivalLocation;

      await manager.save(Transport, transport);

      return { item, transport };
    });
  }

  /**
   * Create a new accommodation itinerary item
   * @param data - Accommodation creation data
   * @returns Promise<{ item: ItineraryItem; accommodation: Accommodation }>
   */
  async createAccommodation(
    data: CreateAccommodationData,
  ): Promise<{ item: ItineraryItem; accommodation: Accommodation }> {
    return this.dataSource.transaction(async (manager) => {
      // Create the base itinerary item
      const itemId = uuidv4();
      const item = manager.create(ItineraryItem, {
        id: itemId,
        tripId: data.tripId,
        type: 'accommodation',
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
        orderIndex: data.orderIndex ?? 0,
      });
      await manager.save(ItineraryItem, item);

      // Create the accommodation-specific data
      const accommodationId = uuidv4();
      const accommodation = manager.create(Accommodation, {
        id: accommodationId,
        itineraryItemId: itemId,
        name: data.name,
        confirmationNumber: data.confirmationNumber,
        phoneNumber: data.phoneNumber,
        duration: data.duration,
      });

      // Set location using the virtual setter
      accommodation.location = data.location;

      await manager.save(Accommodation, accommodation);

      return { item, accommodation };
    });
  }

  /**
   * Update an itinerary item (base fields only)
   * @param id - Itinerary item ID
   * @param data - Partial item data to update
   * @returns Promise<ItineraryItem | null>
   */
  async update(
    id: string,
    data: Partial<Omit<ItineraryItem, 'id' | 'tripId' | 'type'>>,
  ): Promise<ItineraryItem | null> {
    await this.itineraryItemRepository.update(id, data);
    return this.findById(id);
  }

  /**
   * Update flight-specific data
   * @param itineraryItemId - Itinerary item ID
   * @param data - Partial flight data to update
   * @returns Promise<Flight | null>
   */
  async updateFlight(
    itineraryItemId: string,
    data: Partial<Omit<Flight, 'id' | 'itineraryItemId' | 'departureLocationJson' | 'arrivalLocationJson'>> & {
      departureLocation?: Location;
      arrivalLocation?: Location;
    },
  ): Promise<Flight | null> {
    const flight = await this.flightRepository.findOne({
      where: { itineraryItemId },
    });

    if (!flight) {
      return null;
    }

    // Update locations if provided
    if (data.departureLocation) {
      flight.departureLocation = data.departureLocation;
    }
    if (data.arrivalLocation) {
      flight.arrivalLocation = data.arrivalLocation;
    }

    // Update other fields
    Object.assign(flight, {
      flightNumber: data.flightNumber,
      airline: data.airline,
      confirmationCode: data.confirmationCode,
      duration: data.duration,
    });

    return this.flightRepository.save(flight);
  }

  /**
   * Update transport-specific data
   * @param itineraryItemId - Itinerary item ID
   * @param data - Partial transport data to update
   * @returns Promise<Transport | null>
   */
  async updateTransport(
    itineraryItemId: string,
    data: Partial<Omit<Transport, 'id' | 'itineraryItemId' | 'departureLocationJson' | 'arrivalLocationJson'>> & {
      departureLocation?: Location;
      arrivalLocation?: Location;
    },
  ): Promise<Transport | null> {
    const transport = await this.transportRepository.findOne({
      where: { itineraryItemId },
    });

    if (!transport) {
      return null;
    }

    // Update locations if provided
    if (data.departureLocation) {
      transport.departureLocation = data.departureLocation;
    }
    if (data.arrivalLocation) {
      transport.arrivalLocation = data.arrivalLocation;
    }

    // Update other fields
    Object.assign(transport, {
      transportType: data.transportType,
      provider: data.provider,
      confirmationCode: data.confirmationCode,
      duration: data.duration,
    });

    return this.transportRepository.save(transport);
  }

  /**
   * Update accommodation-specific data
   * @param itineraryItemId - Itinerary item ID
   * @param data - Partial accommodation data to update
   * @returns Promise<Accommodation | null>
   */
  async updateAccommodation(
    itineraryItemId: string,
    data: Partial<Omit<Accommodation, 'id' | 'itineraryItemId' | 'locationJson'>> & {
      location?: Location;
    },
  ): Promise<Accommodation | null> {
    const accommodation = await this.accommodationRepository.findOne({
      where: { itineraryItemId },
    });

    if (!accommodation) {
      return null;
    }

    // Update location if provided
    if (data.location) {
      accommodation.location = data.location;
    }

    // Update other fields
    Object.assign(accommodation, {
      name: data.name,
      confirmationNumber: data.confirmationNumber,
      phoneNumber: data.phoneNumber,
      duration: data.duration,
    });

    return this.accommodationRepository.save(accommodation);
  }

  /**
   * Delete an itinerary item (CASCADE will delete specific type data)
   * @param id - Itinerary item ID
   * @returns Promise<boolean> - true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.itineraryItemRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Reorder itinerary items for drag-drop functionality
   * Updates the orderIndex for multiple items
   * @param updates - Array of { id, orderIndex } objects
   * @returns Promise<void>
   */
  async reorder(updates: Array<{ id: string; orderIndex: number }>): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      for (const update of updates) {
        await manager.update(ItineraryItem, update.id, {
          orderIndex: update.orderIndex,
        });
      }
    });
  }

  /**
   * Count itinerary items for a trip
   * @param tripId - Trip ID
   * @returns Promise<number>
   */
  async countByTripId(tripId: string): Promise<number> {
    return this.itineraryItemRepository.count({ where: { tripId } });
  }

  /**
   * Check if an itinerary item exists
   * @param id - Itinerary item ID
   * @returns Promise<boolean>
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.itineraryItemRepository.count({ where: { id } });
    return count > 0;
  }
}
