import { Location } from './location.interface';

/**
 * Base interface for all itinerary items
 * Contains common fields shared across all item types
 */
export interface ItineraryItemBase {
  /** Unique identifier */
  id: string;

  /** ID of the trip this item belongs to */
  tripId: string;

  /** Type discriminator for the item */
  type: 'flight' | 'transport' | 'accommodation';

  /** Item title/description */
  title: string;

  /** Start date/time of the item */
  startDate: string;

  /** End date/time of the item */
  endDate: string;

  /** Optional notes */
  notes?: string;

  /** Order index for sorting */
  orderIndex: number;

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Flight itinerary item
 * Represents air travel with departure and arrival locations
 */
export interface Flight extends ItineraryItemBase {
  type: 'flight';
  
  /** Flight-specific details */
  flight: {
    /** Flight number (e.g., "UA123") */
    flightNumber?: string;

    /** Airline name */
    airline?: string;

    /** Departure location */
    departureLocation: Location;

    /** Arrival location */
    arrivalLocation: Location;

    /** Flight duration in minutes */
    duration: number;

    /** Confirmation code for booking */
    confirmationCode?: string;
  };
}

/**
 * Transport itinerary item
 * Represents ground or sea transportation
 */
export interface Transport extends ItineraryItemBase {
  type: 'transport';
  
  /** Transport-specific details */
  transport: {
    /** Type of transportation (train, bus, car, ferry, etc.) */
    transportType: string;

    /** Departure location */
    departureLocation: Location;

    /** Arrival location */
    arrivalLocation: Location;

    /** Duration in minutes */
    duration: number;

    /** Service provider name */
    provider?: string;

    /** Confirmation code for booking */
    confirmationCode?: string;
  };
}

/**
 * Accommodation itinerary item
 * Represents lodging (hotel, airbnb, etc.)
 */
export interface Accommodation extends ItineraryItemBase {
  type: 'accommodation';
  
  /** Accommodation-specific details */
  accommodation: {
    /** Name of the accommodation */
    name: string;

    /** Location of the accommodation */
    location: Location;

    /** Duration of stay in minutes */
    duration: number;

    /** Confirmation number for booking */
    confirmationNumber?: string;

    /** Contact phone number */
    phoneNumber?: string;
  };
}

/**
 * Union type representing any itinerary item
 * Use type guards to narrow down to specific types
 */
export type ItineraryItem = Flight | Transport | Accommodation;

/**
 * Type guard to check if an item is a Flight
 */
export function isFlight(item: ItineraryItem): item is Flight {
  return item.type === 'flight';
}

/**
 * Type guard to check if an item is Transport
 */
export function isTransport(item: ItineraryItem): item is Transport {
  return item.type === 'transport';
}

/**
 * Type guard to check if an item is Accommodation
 */
export function isAccommodation(item: ItineraryItem): item is Accommodation {
  return item.type === 'accommodation';
}
