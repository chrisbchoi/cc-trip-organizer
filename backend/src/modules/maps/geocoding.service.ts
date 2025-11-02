import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Client, GeocodeResult } from '@googlemaps/google-maps-services-js';
import { LocationCacheRepository } from './location-cache.repository';
import { Location } from '../itinerary/types/location.interface';

/**
 * Service for geocoding addresses using Google Maps API with caching
 * Implements rate limiting and error handling for API calls
 */
@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly googleMapsClient: Client;
  private readonly apiKey: string;

  // Rate limiting: track API calls per minute
  private apiCallTimestamps: number[] = [];
  private readonly maxCallsPerMinute = 50; // Conservative limit

  constructor(
    private readonly locationCacheRepository: LocationCacheRepository,
  ) {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('GOOGLE_MAPS_API_KEY not configured. Geocoding will fail.');
    }
    this.googleMapsClient = new Client({});
  }

  /**
   * Geocode an address to get coordinates and location details
   * Checks cache first, then calls Google Maps API if not cached
   * 
   * @param address - The address string to geocode
   * @returns Promise<Location> - Location with coordinates and details
   * @throws BadRequestException if address is invalid or API call fails
   */
  async geocode(address: string): Promise<Location> {
    if (!address || address.trim().length === 0) {
      throw new BadRequestException('Address cannot be empty');
    }

    const trimmedAddress = address.trim();

    // Check cache first
    this.logger.debug(`Checking cache for address: ${trimmedAddress}`);
    const cached = await this.locationCacheRepository.findByAddress(trimmedAddress);

    if (cached) {
      this.logger.debug('Cache hit for address');
      return {
        address: cached.address,
        formattedAddress: cached.formattedAddress,
        latitude: Number(cached.latitude),
        longitude: Number(cached.longitude),
        city: cached.city,
        country: cached.country,
        placeId: cached.placeId,
      };
    }

    // Cache miss - call Google Maps API
    this.logger.debug('Cache miss - calling Google Maps API');
    
    // Check rate limit
    this.enforceRateLimit();

    // Call Google Maps API
    const location = await this.callGeocodingAPI(trimmedAddress);

    // Store in cache
    try {
      await this.locationCacheRepository.create({
        address: trimmedAddress,
        formattedAddress: location.formattedAddress,
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city,
        country: location.country,
        placeId: location.placeId,
      });
      this.logger.debug('Cached geocoding result');
    } catch (error) {
      // Non-critical error - log but don't fail the request
      this.logger.warn(`Failed to cache geocoding result: ${error}`);
    }

    return location;
  }

  /**
   * Reverse geocode coordinates to get address
   * 
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @returns Promise<Location> - Location with address and details
   * @throws BadRequestException if coordinates are invalid
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<Location> {
    if (!this.isValidCoordinate(latitude, longitude)) {
      throw new BadRequestException('Invalid coordinates');
    }

    this.logger.debug(`Reverse geocoding: ${latitude}, ${longitude}`);
    
    // Check rate limit
    this.enforceRateLimit();

    try {
      const response = await this.googleMapsClient.reverseGeocode({
        params: {
          latlng: { lat: latitude, lng: longitude },
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        throw new BadRequestException('No results found for coordinates');
      }

      const result = response.data.results[0];
      const location = this.parseGeocodeResult(result);

      // Try to cache (if not already cached)
      try {
        await this.locationCacheRepository.create({
          address: location.address,
          formattedAddress: location.formattedAddress,
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
          placeId: location.placeId,
        });
      } catch (error) {
        // Might fail if address already exists - that's okay
        this.logger.debug('Address may already be cached');
      }

      return location;
    } catch (error: any) {
      this.logger.error(`Reverse geocoding failed: ${error.message}`);
      throw new BadRequestException('Failed to reverse geocode coordinates');
    }
  }

  /**
   * Get place details by Google Places ID
   * 
   * @param placeId - Google Places ID
   * @returns Promise<Location> - Location details
   * @throws BadRequestException if place ID is invalid
   */
  async getPlaceDetails(placeId: string): Promise<Location> {
    if (!placeId || placeId.trim().length === 0) {
      throw new BadRequestException('Place ID cannot be empty');
    }

    // Check cache first
    const cached = await this.locationCacheRepository.findByPlaceId(placeId);
    if (cached) {
      this.logger.debug('Cache hit for place ID');
      return {
        address: cached.address,
        formattedAddress: cached.formattedAddress,
        latitude: Number(cached.latitude),
        longitude: Number(cached.longitude),
        city: cached.city,
        country: cached.country,
        placeId: cached.placeId,
      };
    }

    // Check rate limit
    this.enforceRateLimit();

    try {
      const response = await this.googleMapsClient.placeDetails({
        params: {
          place_id: placeId,
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK' || !response.data.result) {
        throw new BadRequestException('Place not found');
      }

      const result = response.data.result;
      const location: Location = {
        address: result.formatted_address || '',
        formattedAddress: result.formatted_address,
        latitude: result.geometry?.location.lat || 0,
        longitude: result.geometry?.location.lng || 0,
        placeId: result.place_id,
      };

      // Extract city and country from address components
      if (result.address_components) {
        for (const component of result.address_components) {
          if (component.types.includes('locality' as any)) {
            location.city = component.long_name;
          }
          if (component.types.includes('country' as any)) {
            location.country = component.long_name;
          }
        }
      }

      // Cache the result
      try {
        await this.locationCacheRepository.create({
          address: location.address,
          formattedAddress: location.formattedAddress,
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
          placeId: location.placeId,
        });
      } catch (error) {
        this.logger.debug('Failed to cache place details (may already exist)');
      }

      return location;
    } catch (error: any) {
      this.logger.error(`Failed to get place details: ${error.message}`);
      throw new BadRequestException('Failed to retrieve place details');
    }
  }

  /**
   * Call Google Maps Geocoding API
   * @private
   */
  private async callGeocodingAPI(address: string): Promise<Location> {
    if (!this.apiKey) {
      throw new BadRequestException('Google Maps API key not configured');
    }

    try {
      this.recordApiCall();

      const response = await this.googleMapsClient.geocode({
        params: {
          address,
          key: this.apiKey,
        },
      });

      if (response.data.status === 'ZERO_RESULTS') {
        throw new BadRequestException('Address not found');
      }

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        throw new BadRequestException(`Geocoding failed: ${response.data.status}`);
      }

      const result = response.data.results[0];
      return this.parseGeocodeResult(result);
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Geocoding API call failed: ${error.message}`);
      throw new BadRequestException('Failed to geocode address');
    }
  }

  /**
   * Parse geocode result from Google Maps API response
   * @private
   */
  private parseGeocodeResult(result: GeocodeResult): Location {
    const location: Location = {
      address: result.formatted_address,
      formattedAddress: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      placeId: result.place_id,
    };

    // Extract city and country from address components
    if (result.address_components) {
      for (const component of result.address_components) {
        if (component.types.includes('locality' as any)) {
          location.city = component.long_name;
        }
        if (component.types.includes('country' as any)) {
          location.country = component.long_name;
        }
      }
    }

    return location;
  }

  /**
   * Validate coordinates
   * @private
   */
  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }

  /**
   * Record an API call timestamp for rate limiting
   * @private
   */
  private recordApiCall(): void {
    const now = Date.now();
    this.apiCallTimestamps.push(now);
  }

  /**
   * Enforce rate limiting by checking recent API calls
   * @private
   * @throws BadRequestException if rate limit exceeded
   */
  private enforceRateLimit(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove timestamps older than 1 minute
    this.apiCallTimestamps = this.apiCallTimestamps.filter(
      (timestamp) => timestamp > oneMinuteAgo,
    );

    if (this.apiCallTimestamps.length >= this.maxCallsPerMinute) {
      this.logger.warn('Rate limit exceeded for geocoding API');
      throw new BadRequestException(
        'Rate limit exceeded. Please try again in a moment.',
      );
    }
  }

  /**
   * Get current rate limit statistics (for monitoring)
   * @returns Object with current call count and limit
   */
  getRateLimitStats(): { current: number; limit: number; remaining: number } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean up old timestamps
    this.apiCallTimestamps = this.apiCallTimestamps.filter(
      (timestamp) => timestamp > oneMinuteAgo,
    );

    return {
      current: this.apiCallTimestamps.length,
      limit: this.maxCallsPerMinute,
      remaining: this.maxCallsPerMinute - this.apiCallTimestamps.length,
    };
  }
}
