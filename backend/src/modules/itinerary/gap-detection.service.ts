import { Injectable } from '@nestjs/common';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { Flight } from './entities/flight.entity';
import { Transport } from './entities/transport.entity';
import { Accommodation } from './entities/accommodation.entity';
import { Location } from './types/location.interface';

export interface ItineraryGap {
  id: string;
  type: 'time' | 'location' | 'accommodation';
  startItem: ItineraryItem;
  endItem: ItineraryItem | null;
  gapDuration: number; // minutes
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestions?: string[];
}

interface ItemWithDetails {
  item: ItineraryItem;
  departureLocation?: Location;
  arrivalLocation?: Location;
  location?: Location;
}

@Injectable()
export class GapDetectionService {
  /**
   * Detects gaps and inconsistencies in an itinerary
   * @param items Array of itinerary items with their associated details
   * @returns Array of detected gaps with severity and suggestions
   */
  async detectGaps(
    items: ItineraryItem[],
    flights?: Flight[],
    transports?: Transport[],
    accommodations?: Accommodation[],
  ): Promise<ItineraryGap[]> {
    if (items.length === 0) {
      return [];
    }

    // Sort items chronologically
    const sortedItems = [...items].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );

    // Build a map of item details for quick lookup
    const itemDetailsMap = this.buildItemDetailsMap(
      sortedItems,
      flights || [],
      transports || [],
      accommodations || [],
    );

    const gaps: ItineraryGap[] = [];

    // Detect gaps between consecutive items
    for (let i = 0; i < sortedItems.length - 1; i++) {
      const currentItem = sortedItems[i];
      const nextItem = sortedItems[i + 1];
      const currentDetails = itemDetailsMap.get(currentItem.id);
      const nextDetails = itemDetailsMap.get(nextItem.id);

      // 1. Detect time gaps
      const timeGap = this.detectTimeGap(currentItem, nextItem);
      if (timeGap) {
        gaps.push(timeGap);
      }

      // 2. Detect location mismatches (for flights and transport)
      if (currentDetails && nextDetails) {
        const locationGap = this.detectLocationMismatch(
          currentItem,
          nextItem,
          currentDetails,
          nextDetails,
        );
        if (locationGap) {
          gaps.push(locationGap);
        }
      }
    }

    // 3. Detect missing overnight accommodations
    const accommodationGaps = this.detectMissingAccommodations(
      sortedItems,
      itemDetailsMap,
    );
    gaps.push(...accommodationGaps);

    return gaps;
  }

  /**
   * Build a map of item IDs to their location details
   */
  private buildItemDetailsMap(
    items: ItineraryItem[],
    flights: Flight[],
    transports: Transport[],
    accommodations: Accommodation[],
  ): Map<string, ItemWithDetails> {
    const map = new Map<string, ItemWithDetails>();

    for (const item of items) {
      const details: ItemWithDetails = { item };

      if (item.type === 'flight') {
        const flight = flights.find((f) => f.itineraryItemId === item.id);
        if (flight) {
          details.departureLocation = flight.departureLocation;
          details.arrivalLocation = flight.arrivalLocation;
        }
      } else if (item.type === 'transport') {
        const transport = transports.find((t) => t.itineraryItemId === item.id);
        if (transport) {
          details.departureLocation = transport.departureLocation;
          details.arrivalLocation = transport.arrivalLocation;
        }
      } else if (item.type === 'accommodation') {
        const accommodation = accommodations.find(
          (a) => a.itineraryItemId === item.id,
        );
        if (accommodation) {
          details.location = accommodation.location;
        }
      }

      map.set(item.id, details);
    }

    return map;
  }

  /**
   * Detect time gaps between consecutive items (> 2 hours)
   */
  private detectTimeGap(
    currentItem: ItineraryItem,
    nextItem: ItineraryItem,
  ): ItineraryGap | null {
    const gapMinutes = this.calculateGapMinutes(
      currentItem.endDate,
      nextItem.startDate,
    );

    // Only flag gaps > 2 hours (120 minutes)
    if (gapMinutes <= 120) {
      return null;
    }

    const severity = this.determineTimeGapSeverity(gapMinutes);
    const message = this.generateTimeGapMessage(gapMinutes, currentItem, nextItem);
    const suggestions = this.generateTimeGapSuggestions(gapMinutes, currentItem, nextItem);

    return {
      id: `time-gap-${currentItem.id}-${nextItem.id}`,
      type: 'time',
      startItem: currentItem,
      endItem: nextItem,
      gapDuration: gapMinutes,
      severity,
      message,
      suggestions,
    };
  }

  /**
   * Detect location mismatches between consecutive travel items
   */
  private detectLocationMismatch(
    currentItem: ItineraryItem,
    nextItem: ItineraryItem,
    currentDetails: ItemWithDetails,
    nextDetails: ItemWithDetails,
  ): ItineraryGap | null {
    // Only check for flights and transport (items with departure/arrival)
    if (
      !currentDetails.arrivalLocation ||
      !nextDetails.departureLocation ||
      (currentItem.type !== 'flight' && currentItem.type !== 'transport') ||
      (nextItem.type !== 'flight' && nextItem.type !== 'transport')
    ) {
      return null;
    }

    // Check if arrival location matches next departure location
    if (
      this.areLocationsSimilar(
        currentDetails.arrivalLocation,
        nextDetails.departureLocation,
      )
    ) {
      return null;
    }

    const gapMinutes = this.calculateGapMinutes(
      currentItem.endDate,
      nextItem.startDate,
    );
    const severity = 'warning' as const;
    const message = this.generateLocationMismatchMessage(
      currentDetails.arrivalLocation,
      nextDetails.departureLocation,
      currentItem,
      nextItem,
    );
    const suggestions = [
      'Add transportation between these locations',
      'Verify the locations are correct',
      'Update arrival or departure location to match',
    ];

    return {
      id: `location-mismatch-${currentItem.id}-${nextItem.id}`,
      type: 'location',
      startItem: currentItem,
      endItem: nextItem,
      gapDuration: gapMinutes,
      severity,
      message,
      suggestions,
    };
  }

  /**
   * Detect missing overnight accommodations
   */
  private detectMissingAccommodations(
    sortedItems: ItineraryItem[],
    itemDetailsMap: Map<string, ItemWithDetails>,
  ): ItineraryGap[] {
    const gaps: ItineraryGap[] = [];
    const accommodationItems = sortedItems.filter(
      (item) => item.type === 'accommodation',
    );

    for (let i = 0; i < sortedItems.length - 1; i++) {
      const currentItem = sortedItems[i];
      const nextItem = sortedItems[i + 1];

      // Skip if either item is an accommodation
      if (
        currentItem.type === 'accommodation' ||
        nextItem.type === 'accommodation'
      ) {
        continue;
      }

      const gapMinutes = this.calculateGapMinutes(
        currentItem.endDate,
        nextItem.startDate,
      );

      // Check if gap spans overnight (> 6 hours typically indicates overnight)
      if (gapMinutes <= 360) {
        // 6 hours
        continue;
      }

      // Check if there's an accommodation covering this period
      const hasAccommodation = accommodationItems.some((acc) => {
        return (
          acc.startDate <= currentItem.endDate &&
          acc.endDate >= nextItem.startDate
        );
      });

      if (!hasAccommodation) {
        const severity = this.determineMissingAccommodationSeverity(gapMinutes);
        const message = this.generateMissingAccommodationMessage(
          gapMinutes,
          currentItem,
          nextItem,
        );
        const suggestions = [
          'Add accommodation for this overnight period',
          'Verify your travel dates',
          'Consider if you\'re staying with friends/family',
        ];

        gaps.push({
          id: `missing-accommodation-${currentItem.id}-${nextItem.id}`,
          type: 'accommodation',
          startItem: currentItem,
          endItem: nextItem,
          gapDuration: gapMinutes,
          severity,
          message,
          suggestions,
        });
      }
    }

    return gaps;
  }

  /**
   * Calculate gap duration in minutes between two dates
   */
  private calculateGapMinutes(endDate: Date, startDate: Date): number {
    return Math.floor((startDate.getTime() - endDate.getTime()) / (1000 * 60));
  }

  /**
   * Check if two locations are similar (same city or close coordinates)
   */
  private areLocationsSimilar(loc1: Location, loc2: Location): boolean {
    // First try city comparison
    if (loc1.city && loc2.city) {
      if (loc1.city.toLowerCase() === loc2.city.toLowerCase()) {
        return true;
      }
    }

    // Then try coordinate comparison (within ~50km radius)
    if (
      loc1.latitude !== undefined &&
      loc1.longitude !== undefined &&
      loc2.latitude !== undefined &&
      loc2.longitude !== undefined
    ) {
      const distance = this.calculateDistance(
        loc1.latitude,
        loc1.longitude,
        loc2.latitude,
        loc2.longitude,
      );
      return distance < 50; // 50km threshold
    }

    // Fallback to address comparison
    return (
      loc1.address.toLowerCase().includes(loc2.city?.toLowerCase() || '') ||
      loc2.address.toLowerCase().includes(loc1.city?.toLowerCase() || '')
    );
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Determine severity for time gaps
   */
  private determineTimeGapSeverity(
    gapMinutes: number,
  ): 'info' | 'warning' | 'error' {
    if (gapMinutes > 1440) {
      // > 24 hours
      return 'error';
    }
    if (gapMinutes > 480) {
      // > 8 hours
      return 'warning';
    }
    return 'info';
  }

  /**
   * Determine severity for missing accommodations
   */
  private determineMissingAccommodationSeverity(
    gapMinutes: number,
  ): 'info' | 'warning' | 'error' {
    if (gapMinutes > 1440) {
      // > 24 hours
      return 'error';
    }
    if (gapMinutes > 720) {
      // > 12 hours
      return 'warning';
    }
    return 'info';
  }

  /**
   * Generate human-readable message for time gaps
   */
  private generateTimeGapMessage(
    gapMinutes: number,
    currentItem: ItineraryItem,
    nextItem: ItineraryItem,
  ): string {
    const hours = Math.floor(gapMinutes / 60);
    const minutes = gapMinutes % 60;
    const durationStr =
      hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;

    return `${durationStr} gap between "${currentItem.title}" and "${nextItem.title}"`;
  }

  /**
   * Generate suggestions for time gaps
   */
  private generateTimeGapSuggestions(
    gapMinutes: number,
    currentItem: ItineraryItem,
    nextItem: ItineraryItem,
  ): string[] {
    const suggestions: string[] = [];

    if (gapMinutes > 1440) {
      // > 24 hours
      suggestions.push('Consider adding accommodation for this period');
      suggestions.push('Add activities or sightseeing during this time');
    } else if (gapMinutes > 480) {
      // > 8 hours
      suggestions.push('Add transportation details if traveling');
      suggestions.push('Consider if this is intentional downtime');
    } else {
      suggestions.push('This may be normal transition time');
      suggestions.push('Verify if additional activities are needed');
    }

    return suggestions;
  }

  /**
   * Generate human-readable message for location mismatches
   */
  private generateLocationMismatchMessage(
    arrivalLocation: Location,
    departureLocation: Location,
    currentItem: ItineraryItem,
    nextItem: ItineraryItem,
  ): string {
    const arrivalCity = arrivalLocation.city || arrivalLocation.address;
    const departureCity = departureLocation.city || departureLocation.address;

    return `Location mismatch: "${currentItem.title}" arrives in ${arrivalCity} but "${nextItem.title}" departs from ${departureCity}`;
  }

  /**
   * Generate human-readable message for missing accommodations
   */
  private generateMissingAccommodationMessage(
    gapMinutes: number,
    currentItem: ItineraryItem,
    nextItem: ItineraryItem,
  ): string {
    const hours = Math.floor(gapMinutes / 60);
    const nights = Math.ceil(hours / 24);

    return `Missing accommodation: ${nights} night${nights > 1 ? 's' : ''} between "${currentItem.title}" and "${nextItem.title}"`;
  }
}
