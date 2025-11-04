/**
 * Location interface matching the backend Location type
 */
export interface Location {
  address: string;
  formattedAddress?: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  placeId?: string;
}

/**
 * Utility class for working with Location objects
 */
export class LocationUtils {
  /**
   * Generate a Google Maps URL for a location
   * @param location - Location object
   * @returns Google Maps search URL
   */
  static getGoogleMapsUrl(location: Location): string {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }

  /**
   * Get formatted coordinates string
   * @param location - Location object
   * @returns Formatted coordinates (e.g., "40.7128, -74.0060")
   */
  static getCoordinatesString(location: Location): string {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }

  /**
   * Calculate distance between two locations using Haversine formula
   * @param from - Starting location
   * @param to - Ending location
   * @returns Distance in kilometers
   */
  static calculateDistance(from: Location, to: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(to.latitude - from.latitude);
    const dLon = this.toRad(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.latitude)) *
        Math.cos(this.toRad(to.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians
   * @param degrees - Angle in degrees
   * @returns Angle in radians
   */
  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Get display name for location
   * @param location - Location object
   * @returns Display name (city, country or address)
   */
  static getDisplayName(location: Location): string {
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }
    if (location.city) {
      return location.city;
    }
    return location.address;
  }

  /**
   * Validate location has required fields
   * @param location - Location object to validate
   * @returns True if valid
   */
  static isValid(location: Location): boolean {
    return (
      location.address !== undefined &&
      location.address !== '' &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      !isNaN(location.latitude) &&
      !isNaN(location.longitude) &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180
    );
  }
}
