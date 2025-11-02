import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { GapDetectionService, ItineraryGap } from './gap-detection.service';
import { ItineraryService } from './itinerary.service';

/**
 * Controller for gap detection in trip itineraries
 * Provides endpoint to analyze itineraries for time gaps, location mismatches,
 * and missing accommodations
 */
@Controller('api')
export class GapDetectionController {
  constructor(
    private readonly gapDetectionService: GapDetectionService,
    private readonly itineraryService: ItineraryService,
  ) {}

  /**
   * Detect gaps in a trip's itinerary
   * 
   * Analyzes the complete itinerary for:
   * - Time gaps between consecutive items (>2 hours)
   * - Location mismatches (arrival city ≠ next departure city)
   * - Missing overnight accommodations (>6 hours without lodging)
   * 
   * @param tripId - Trip ID to analyze
   * @returns Promise<ItineraryGap[]> - Array of detected gaps with severity and suggestions
   * @throws NotFoundException if trip has no itinerary items
   */
  @Get('trips/:tripId/gaps')
  @HttpCode(HttpStatus.OK)
  async detectGaps(@Param('tripId') tripId: string): Promise<ItineraryGap[]> {
    // Retrieve all itinerary items for the trip
    const items = await this.itineraryService.findByTripId(tripId);

    // Return empty array if no items exist (valid state, not an error)
    if (!items || items.length === 0) {
      return [];
    }

    // Get related entities for detailed gap detection
    const flights = items
      .filter((item) => item.type === 'flight')
      .map((item) => item as any); // TypeORM will have loaded the flight relation

    const transports = items
      .filter((item) => item.type === 'transport')
      .map((item) => item as any);

    const accommodations = items
      .filter((item) => item.type === 'accommodation')
      .map((item) => item as any);

    // Run gap detection algorithm
    const gaps = await this.gapDetectionService.detectGaps(
      items,
      flights,
      transports,
      accommodations,
    );

    return gaps;
  }
}
