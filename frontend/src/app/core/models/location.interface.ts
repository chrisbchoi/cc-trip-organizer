/**
 * Location interface for itinerary items
 * Matches the backend Location interface
 * Used for storing location data with geocoding information
 */
export interface Location {
  /** Full address string */
  address: string;

  /** Formatted address from geocoding service */
  formattedAddress?: string;

  /** Latitude coordinate */
  latitude: number;

  /** Longitude coordinate */
  longitude: number;

  /** City name */
  city?: string;

  /** Country name */
  country?: string;

  /** Google Places ID for location reference */
  placeId?: string;
}
