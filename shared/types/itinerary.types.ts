import { Location } from './trip.types';

/**
 * Base interface for all itinerary items
 */
export interface ItineraryItemBase {
  id: string;
  tripId: string;
  type: 'flight' | 'transport' | 'accommodation';
  startDateTime: string; // ISO 8601 datetime string
  endDateTime: string;   // ISO 8601 datetime string
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Flight details
 */
export interface Flight extends ItineraryItemBase {
  type: 'flight';
  flightNumber: string;
  airline: string;
  departureLocation: Location;
  arrivalLocation: Location;
  confirmationNumber?: string;
}

/**
 * Ground transportation (car, train, bus, etc.)
 */
export interface Transport extends ItineraryItemBase {
  type: 'transport';
  transportType: 'car' | 'train' | 'bus' | 'ferry' | 'other';
  departureLocation: Location;
  arrivalLocation: Location;
  confirmationNumber?: string;
  provider?: string;
}

/**
 * Accommodation (hotel, Airbnb, etc.)
 */
export interface Accommodation extends ItineraryItemBase {
  type: 'accommodation';
  name: string;
  location: Location;
  confirmationNumber?: string;
  checkInDateTime: string;
  checkOutDateTime: string;
}

/**
 * Union type for all itinerary items
 */
export type ItineraryItem = Flight | Transport | Accommodation;

/**
 * Gap detected between itinerary items
 */
export interface ItineraryGap {
  startDateTime: string;
  endDateTime: string;
  durationHours: number;
  previousItem?: ItineraryItem;
  nextItem?: ItineraryItem;
  suggestion?: 'transport' | 'accommodation';
}
