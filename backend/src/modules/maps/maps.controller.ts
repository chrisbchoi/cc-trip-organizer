import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { MapsService } from './maps.service';
import { GeocodeRequestDto, DirectionsRequestDto } from './dto';
import { Location } from '../itinerary/types/location.interface';

/**
 * Maps Controller
 * Provides API endpoints for geocoding, place details, and directions
 * Acts as a proxy to Google Maps API with caching
 */
@Controller('api/maps')
export class MapsController {
  private readonly logger = new Logger(MapsController.name);

  constructor(private readonly mapsService: MapsService) {}

  /**
   * POST /api/maps/geocode
   * Geocode an address to geographic coordinates
   * @param geocodeRequest - Request containing address to geocode
   * @returns Location object with coordinates
   */
  @Post('geocode')
  @HttpCode(HttpStatus.OK)
  async geocodeAddress(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    geocodeRequest: GeocodeRequestDto,
  ): Promise<Location> {
    const { address } = geocodeRequest;

    if (!address || address.trim().length === 0) {
      throw new BadRequestException('Address cannot be empty');
    }

    try {
      this.logger.log(`Geocoding address: ${address}`);
      const location = await this.mapsService.geocodeAddress(address.trim());

      if (!location) {
        throw new NotFoundException(
          `Could not geocode address: ${address}. Please check the address and try again.`,
        );
      }

      return location;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error geocoding address: ${address}`, errorStack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (errorMessage.includes('API key')) {
        throw new BadRequestException(
          'Maps service is not properly configured. Please contact support.',
        );
      }

      if (errorMessage.includes('rate limit')) {
        throw new BadRequestException(
          'Too many requests. Please try again later.',
        );
      }

      throw new BadRequestException(
        'Failed to geocode address. Please try again.',
      );
    }
  }

  /**
   * GET /api/maps/place/:placeId
   * Get detailed information about a place using Google Places ID
   * @param placeId - Google Places ID
   * @returns Location object with place details
   */
  @Get('place/:placeId')
  async getPlaceDetails(@Param('placeId') placeId: string): Promise<Location> {
    if (!placeId || placeId.trim().length === 0) {
      throw new BadRequestException('Place ID cannot be empty');
    }

    try {
      this.logger.log(`Getting place details for: ${placeId}`);
      const location = await this.mapsService.getPlaceDetails(placeId.trim());

      if (!location) {
        throw new NotFoundException(
          `Place not found for ID: ${placeId}. The place may not exist or has been removed.`,
        );
      }

      return location;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error getting place details for: ${placeId}`,
        errorStack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (errorMessage.includes('API key')) {
        throw new BadRequestException(
          'Maps service is not properly configured. Please contact support.',
        );
      }

      throw new BadRequestException(
        'Failed to retrieve place details. Please try again.',
      );
    }
  }

  /**
   * POST /api/maps/directions
   * Generate a Google Maps directions URL between two locations
   * @param directionsRequest - Request containing from/to coordinates
   * @returns Object with directions URL
   */
  @Post('directions')
  @HttpCode(HttpStatus.OK)
  async getDirections(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    directionsRequest: DirectionsRequestDto,
  ): Promise<{ url: string; distance: number }> {
    const { from, to } = directionsRequest;

    // Validate coordinates
    if (!this.isValidCoordinate(from.latitude, from.longitude)) {
      throw new BadRequestException(
        'Invalid origin coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.',
      );
    }

    if (!this.isValidCoordinate(to.latitude, to.longitude)) {
      throw new BadRequestException(
        'Invalid destination coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.',
      );
    }

    try {
      this.logger.log(
        `Generating directions from (${from.latitude}, ${from.longitude}) to (${to.latitude}, ${to.longitude})`,
      );

      // Create Location objects from coordinates
      const fromLocation: Location = {
        address: '',
        latitude: from.latitude,
        longitude: from.longitude,
      };

      const toLocation: Location = {
        address: '',
        latitude: to.latitude,
        longitude: to.longitude,
      };

      // Generate directions URL
      const url = this.mapsService.generateDirectionsUrl(
        fromLocation,
        toLocation,
      );

      // Calculate distance
      const distance = this.mapsService.calculateDistance(
        fromLocation,
        toLocation,
      );

      return { url, distance };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Error generating directions', errorStack);
      throw new BadRequestException(
        'Failed to generate directions. Please try again.',
      );
    }
  }

  /**
   * GET /api/maps/cache/stats
   * Get cache statistics (for monitoring/debugging)
   * @returns Cache statistics
   */
  @Get('cache/stats')
  async getCacheStats(): Promise<{ total: number; apiStats: any }> {
    try {
      return await this.mapsService.getCacheStats();
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Error getting cache stats', errorStack);
      throw new BadRequestException('Failed to retrieve cache statistics.');
    }
  }

  /**
   * Validate if coordinates are within valid ranges
   * @private
   */
  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }
}
