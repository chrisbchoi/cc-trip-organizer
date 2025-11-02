/**
 * Main trip entity representing a complete travel itinerary
 */
export interface Trip {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string; // ISO 8601 date string
  endDate: string;   // ISO 8601 date string
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}

/**
 * Location with geographic coordinates
 */
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}
