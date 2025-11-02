import { ItineraryItemBase } from './itinerary-item.model';
import { Location, LocationUtils } from './location.model';

/**
 * Flight model extending ItineraryItemBase
 */
export class Flight extends ItineraryItemBase {
  flightNumber!: string;
  airline!: string;
  confirmationCode?: string;
  departureLocation!: Location;
  arrivalLocation!: Location;

  constructor(data?: Partial<Flight>) {
    super(data);
    if (data) {
      Object.assign(this, data);
      // Ensure type is set correctly
      this.type = 'flight';
    }
  }

  /**
   * Get the flight duration in minutes
   * @returns Duration in minutes
   */
  getDuration(): number {
    const diffMs = this.endDate.getTime() - this.startDate.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  /**
   * Get display information for the flight
   * @returns Formatted flight info
   */
  getDisplayInfo(): string {
    const airline = this.airline || 'Unknown Airline';
    const flightNum = this.flightNumber || 'N/A';
    return `${airline} ${flightNum}`;
  }

  /**
   * Validate the flight data
   * @returns Object with isValid flag and error messages
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!this.flightNumber || this.flightNumber.trim().length === 0) {
      errors.push('Flight number is required');
    }

    if (!this.airline || this.airline.trim().length === 0) {
      errors.push('Airline is required');
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
      errors
    };
  }

  /**
   * Get airport codes if available (simplified - extracts from city names)
   * @returns Formatted route string (e.g., "LAX → JFK")
   */
  getAirportRoute(): string {
    const departure = LocationUtils.getDisplayName(this.departureLocation);
    const arrival = LocationUtils.getDisplayName(this.arrivalLocation);
    return `${departure} → ${arrival}`;
  }

  /**
   * Calculate flight distance using great-circle distance
   * @returns Distance in kilometers
   */
  getDistance(): number {
    return LocationUtils.calculateDistance(
      this.departureLocation,
      this.arrivalLocation
    );
  }

  /**
   * Get formatted distance string
   * @returns Distance with unit (e.g., "5,234 km")
   */
  getFormattedDistance(): string {
    const distance = this.getDistance();
    return `${distance.toLocaleString('en-US', { maximumFractionDigits: 0 })} km`;
  }

  /**
   * Get average speed of the flight
   * @returns Speed in km/h
   */
  getAverageSpeed(): number {
    const distance = this.getDistance();
    const hours = this.getDuration() / 60;
    return distance / hours;
  }

  /**
   * Get departure time formatted
   * @returns Formatted departure time
   */
  getDepartureTime(): string {
    return this.startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
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
      hour12: true
    });
  }

  /**
   * Check if this is a long-haul flight (> 6 hours)
   * @returns True if flight is longer than 6 hours
   */
  isLongHaul(): boolean {
    return this.getDuration() > 360; // 6 hours in minutes
  }

  /**
   * Check if this is an international flight (simple check based on countries)
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
   * Create a deep copy of the flight
   * @returns New Flight instance
   */
  clone(): Flight {
    return new Flight({
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
      flightNumber: this.flightNumber,
      airline: this.airline,
      confirmationCode: this.confirmationCode,
      departureLocation: { ...this.departureLocation },
      arrivalLocation: { ...this.arrivalLocation }
    });
  }
}
