import { ItineraryItemBase } from './itinerary-item.model';
import { Location, LocationUtils } from './location.model';

/**
 * Transport types
 */
export type TransportType = 'train' | 'bus' | 'car' | 'ferry' | 'other';

/**
 * Transport model extending ItineraryItemBase
 */
export class Transport extends ItineraryItemBase {
  transportType!: TransportType;
  provider?: string;
  confirmationCode?: string;
  departureLocation!: Location;
  arrivalLocation!: Location;

  constructor(data?: Partial<Transport>) {
    super(data);
    if (data) {
      // Assign transport-specific fields without overwriting dates converted by super()
      if (data.transportType !== undefined) this.transportType = data.transportType;
      if (data.provider !== undefined) this.provider = data.provider;
      if (data.confirmationCode !== undefined) this.confirmationCode = data.confirmationCode;
      if (data.departureLocation !== undefined) this.departureLocation = data.departureLocation;
      if (data.arrivalLocation !== undefined) this.arrivalLocation = data.arrivalLocation;
      // Ensure type is set correctly
      this.type = 'transport';
    }
  }

  /**
   * Get the transport duration in minutes
   * @returns Duration in minutes
   */
  getDuration(): number {
    const diffMs = this.endDate.getTime() - this.startDate.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  /**
   * Get display information for the transport
   * @returns Formatted transport info
   */
  getDisplayInfo(): string {
    const type = this.getTransportTypeName();
    const provider = this.provider ? ` - ${this.provider}` : '';
    return `${type}${provider}`;
  }

  /**
   * Validate the transport data
   * @returns Object with isValid flag and error messages
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!this.transportType) {
      errors.push('Transport type is required');
    }

    if (!this.startDate) {
      errors.push('Departure date/time is required');
    }

    if (!this.endDate) {
      errors.push('Arrival date/time is required');
    }

    if (this.startDate && this.endDate && this.endDate <= this.startDate) {
      errors.push('Arrival time must be after departure time');
    }

    if (!this.departureLocation) {
      errors.push('Departure location is required');
    } else if (!LocationUtils.isValid(this.departureLocation)) {
      errors.push('Departure location is invalid');
    }

    if (!this.arrivalLocation) {
      errors.push('Arrival location is required');
    } else if (!LocationUtils.isValid(this.arrivalLocation)) {
      errors.push('Arrival location is invalid');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get icon name for the transport type (for UI)
   * @returns Icon name string
   */
  getTransportIcon(): string {
    const iconMap: Record<TransportType, string> = {
      train: 'train',
      bus: 'directions_bus',
      car: 'directions_car',
      ferry: 'directions_boat',
      other: 'directions',
    };
    return iconMap[this.transportType] || 'directions';
  }

  /**
   * Get human-readable transport type name
   * @returns Transport type name
   */
  getTransportTypeName(): string {
    const nameMap: Record<TransportType, string> = {
      train: 'Train',
      bus: 'Bus',
      car: 'Car',
      ferry: 'Ferry',
      other: 'Transport',
    };
    return nameMap[this.transportType] || 'Transport';
  }

  /**
   * Get route string
   * @returns Formatted route (e.g., "New York → Boston")
   */
  getRouteString(): string {
    const departure = LocationUtils.getDisplayName(this.departureLocation);
    const arrival = LocationUtils.getDisplayName(this.arrivalLocation);
    return `${departure} → ${arrival}`;
  }

  /**
   * Calculate transport distance using great-circle distance
   * @returns Distance in kilometers
   */
  getDistance(): number {
    return LocationUtils.calculateDistance(this.departureLocation, this.arrivalLocation);
  }

  /**
   * Get formatted distance string
   * @returns Distance with unit (e.g., "245 km")
   */
  getFormattedDistance(): string {
    const distance = this.getDistance();
    return `${distance.toLocaleString('en-US', { maximumFractionDigits: 0 })} km`;
  }

  /**
   * Get average speed of the transport
   * @returns Speed in km/h
   */
  getAverageSpeed(): number {
    const distance = this.getDistance();
    const hours = this.getDuration() / 60;
    return hours > 0 ? distance / hours : 0;
  }

  /**
   * Get departure time formatted
   * @returns Formatted departure time
   */
  getDepartureTime(): string {
    return this.startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Get arrival time formatted
   * @returns Formatted arrival time
   */
  getArrivalTime(): string {
    return this.endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Check if this is a long journey (> 4 hours)
   * @returns True if journey is longer than 4 hours
   */
  isLongJourney(): boolean {
    return this.getDuration() > 240; // 4 hours in minutes
  }

  /**
   * Check if this is an international journey (simple check based on countries)
   * @returns True if departure and arrival countries differ
   */
  isInternational(): boolean {
    return (
      this.departureLocation.country !== undefined &&
      this.arrivalLocation.country !== undefined &&
      this.departureLocation.country !== this.arrivalLocation.country
    );
  }

  /**
   * Create a deep copy of the transport
   * @returns New Transport instance
   */
  clone(): Transport {
    return new Transport({
      id: this.id,
      tripId: this.tripId,
      type: this.type,
      title: this.title,
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate),
      notes: this.notes,
      orderIndex: this.orderIndex,
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt),
      transportType: this.transportType,
      provider: this.provider,
      confirmationCode: this.confirmationCode,
      departureLocation: { ...this.departureLocation },
      arrivalLocation: { ...this.arrivalLocation },
    });
  }
}
