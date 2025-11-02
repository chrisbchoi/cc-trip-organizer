import { Injectable, Logger } from '@nestjs/common';
import { GeocodingService } from './geocoding.service';
import { LocationCacheRepository } from './location-cache.repository';
import { Location } from '../itinerary/types/location.interface';

/**
 * Main maps service providing high-level mapping functionality
 * Coordinates between geocoding service and location cache
 */
@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);

  constructor(
    private readonly geocodingService: GeocodingService,
    private readonly locationCacheRepository: LocationCacheRepository,
  ) {}

  /**
   * Geocode an address to coordinates
   * @param address - Address string to geocode
   * @returns Promise<Location> - Location with coordinates
   */
  async geocodeAddress(address: string): Promise<Location> {
    this.logger.debug(`Geocoding address: ${address}`);
    return this.geocodingService.geocode(address);
  }

  /**
   * Reverse geocode coordinates to address
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @returns Promise<Location> - Location with address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<Location> {
    this.logger.debug(`Reverse geocoding: ${latitude}, ${longitude}`);
    return this.geocodingService.reverseGeocode(latitude, longitude);
  }

  /**
   * Get place details by Google Places ID
   * @param placeId - Google Places ID
   * @returns Promise<Location> - Complete location details
   */
  async getPlaceDetails(placeId: string): Promise<Location> {
    this.logger.debug(`Getting place details for: ${placeId}`);
    return this.geocodingService.getPlaceDetails(placeId);
  }

  /**
   * Search cached locations by address
   * Useful for autocomplete functionality
   * @param searchTerm - Partial address to search
   * @param limit - Maximum number of results
   * @returns Promise<Location[]> - Array of matching locations
   */
  async searchCachedLocations(
    searchTerm: string,
    limit = 10,
  ): Promise<Location[]> {
    this.logger.debug(`Searching cached locations: ${searchTerm}`);
    const cached = await this.locationCacheRepository.searchByAddress(
      searchTerm,
      limit,
    );

    return cached.map((cache) => ({
      address: cache.address,
      formattedAddress: cache.formattedAddress,
      latitude: Number(cache.latitude),
      longitude: Number(cache.longitude),
      city: cache.city,
      country: cache.country,
      placeId: cache.placeId,
    }));
  }

  /**
   * Calculate distance between two locations using Haversine formula
   * @param from - Starting location
   * @param to - Destination location
   * @returns number - Distance in kilometers
   */
  calculateDistance(from: Location, to: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) *
        Math.cos(this.toRadians(to.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate distance between two coordinate pairs
   * @param lat1 - Starting latitude
   * @param lon1 - Starting longitude
   * @param lat2 - Destination latitude
   * @param lon2 - Destination longitude
   * @returns number - Distance in kilometers
   */
  calculateDistanceFromCoordinates(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    return this.calculateDistance(
      { address: '', latitude: lat1, longitude: lon1 },
      { address: '', latitude: lat2, longitude: lon2 },
    );
  }

  /**
   * Generate Google Maps URL for a location
   * @param location - Location to generate URL for
   * @returns string - Google Maps URL
   */
  generateMapsUrl(location: Location): string {
    if (location.placeId) {
      return `https://www.google.com/maps/place/?q=place_id:${location.placeId}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }

  /**
   * Generate Google Maps directions URL between two locations
   * @param from - Starting location
   * @param to - Destination location
   * @returns string - Google Maps directions URL
   */
  generateDirectionsUrl(from: Location, to: Location): string {
    const origin = `${from.latitude},${from.longitude}`;
    const destination = `${to.latitude},${to.longitude}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  }

  /**
   * Get cache statistics
   * @returns Promise<{total: number, stats: any}> - Cache statistics
   */
  async getCacheStats(): Promise<{ total: number; apiStats: any }> {
    const total = await this.locationCacheRepository.count();
    const apiStats = this.geocodingService.getRateLimitStats();

    return {
      total,
      apiStats,
    };
  }

  /**
   * Clear old cache entries (maintenance operation)
   * @param daysOld - Delete entries older than this many days
   * @returns Promise<number> - Number of entries deleted
   */
  async clearOldCache(daysOld = 90): Promise<number> {
    this.logger.log(`Clearing cache entries older than ${daysOld} days`);
    const deleted = await this.locationCacheRepository.deleteOldEntries(daysOld);
    this.logger.log(`Deleted ${deleted} old cache entries`);
    return deleted;
  }

  /**
   * Convert degrees to radians
   * @private
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
