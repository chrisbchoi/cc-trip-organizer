import { ItineraryItemBase } from './itinerary-item.model';
import { Location, LocationUtils } from './location.model';

/**
 * Accommodation model extending ItineraryItemBase
 */
export class Accommodation extends ItineraryItemBase {
  name!: string;
  location!: Location;
  confirmationNumber?: string;
  phoneNumber?: string;

  constructor(data?: Partial<Accommodation>) {
    super(data);
    if (data) {
      // Assign accommodation-specific fields without overwriting dates converted by super()
      if (data.name !== undefined) this.name = data.name;
      if (data.location !== undefined) this.location = data.location;
      if (data.confirmationNumber !== undefined) this.confirmationNumber = data.confirmationNumber;
      if (data.phoneNumber !== undefined) this.phoneNumber = data.phoneNumber;
      // Ensure type is set correctly
      this.type = 'accommodation';
    }
  }

  /**
   * Get the accommodation duration in minutes (from check-in to check-out)
   * @returns Duration in minutes
   */
  getDuration(): number {
    const diffMs = this.endDate.getTime() - this.startDate.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  /**
   * Get display information for the accommodation
   * @returns Formatted accommodation info
   */
  getDisplayInfo(): string {
    const name = this.name || 'Accommodation';
    const locationName = LocationUtils.getDisplayName(this.location);
    return `${name} - ${locationName}`;
  }

  /**
   * Validate the accommodation data
   * @returns Object with isValid flag and error messages
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Accommodation name is required');
    }

    if (!this.startDate) {
      errors.push('Check-in date/time is required');
    }

    if (!this.endDate) {
      errors.push('Check-out date/time is required');
    }

    if (this.startDate && this.endDate && this.endDate <= this.startDate) {
      errors.push('Check-out time must be after check-in time');
    }

    if (!this.location) {
      errors.push('Location is required');
    } else if (!LocationUtils.isValid(this.location)) {
      errors.push('Location is invalid');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get number of nights staying at the accommodation
   * @returns Number of nights
   */
  getNightsCount(): number {
    const diffMs = this.endDate.getTime() - this.startDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return Math.floor(diffDays);
  }

  /**
   * Get formatted nights count string
   * @returns Formatted string (e.g., "3 nights")
   */
  getFormattedNightsCount(): string {
    const nights = this.getNightsCount();
    return `${nights} ${nights === 1 ? 'night' : 'nights'}`;
  }

  /**
   * Get check-in time formatted
   * @returns Formatted check-in time
   */
  getCheckInTime(): string {
    return this.startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Get check-out time formatted
   * @returns Formatted check-out time
   */
  getCheckOutTime(): string {
    return this.endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Get check-in date formatted
   * @returns Formatted check-in date
   */
  getCheckInDate(): string {
    return this.startDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get check-out date formatted
   * @returns Formatted check-out date
   */
  getCheckOutDate(): string {
    return this.endDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get full check-in date and time formatted
   * @returns Formatted string (e.g., "Mon, Jan 15 at 3:00 PM")
   */
  getCheckInDateTime(): string {
    return `${this.getCheckInDate()} at ${this.getCheckInTime()}`;
  }

  /**
   * Get full check-out date and time formatted
   * @returns Formatted string (e.g., "Thu, Jan 18 at 11:00 AM")
   */
  getCheckOutDateTime(): string {
    return `${this.getCheckOutDate()} at ${this.getCheckOutTime()}`;
  }

  /**
   * Check if this is a long stay (> 7 nights)
   * @returns True if stay is longer than 7 nights
   */
  isLongStay(): boolean {
    return this.getNightsCount() > 7;
  }

  /**
   * Check if this is an overnight stay (> 12 hours)
   * @returns True if duration is more than 12 hours
   */
  isOvernight(): boolean {
    return this.getDuration() > 720; // 12 hours in minutes
  }

  /**
   * Get location display name
   * @returns Location display name
   */
  getLocationName(): string {
    return LocationUtils.getDisplayName(this.location);
  }

  /**
   * Get Google Maps URL for the accommodation location
   * @returns Google Maps URL
   */
  getMapsUrl(): string {
    return LocationUtils.getGoogleMapsUrl(this.location);
  }

  /**
   * Get coordinates string for the accommodation location
   * @returns Coordinates string
   */
  getCoordinates(): string {
    return LocationUtils.getCoordinatesString(this.location);
  }

  /**
   * Create a deep copy of the accommodation
   * @returns New Accommodation instance
   */
  clone(): Accommodation {
    return new Accommodation({
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
      name: this.name,
      location: { ...this.location },
      confirmationNumber: this.confirmationNumber,
      phoneNumber: this.phoneNumber,
    });
  }
}
