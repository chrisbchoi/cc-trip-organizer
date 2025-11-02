import { Location } from './location.model';

/**
 * Type of itinerary item
 */
export type ItineraryItemType = 'flight' | 'transport' | 'accommodation';

/**
 * Abstract base class for all itinerary items
 */
export abstract class ItineraryItemBase {
  id!: string;
  tripId!: string;
  type!: ItineraryItemType;
  title!: string;
  startDate!: Date;
  endDate!: Date;
  notes?: string;
  orderIndex!: number;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data?: Partial<ItineraryItemBase>) {
    if (data) {
      Object.assign(this, data);
      // Convert date strings to Date objects if needed
      if (typeof data.startDate === 'string') {
        this.startDate = new Date(data.startDate);
      }
      if (typeof data.endDate === 'string') {
        this.endDate = new Date(data.endDate);
      }
      if (typeof data.createdAt === 'string') {
        this.createdAt = new Date(data.createdAt);
      }
      if (typeof data.updatedAt === 'string') {
        this.updatedAt = new Date(data.updatedAt);
      }
    }
  }

  /**
   * Get the duration of the item in minutes
   * Must be implemented by subclasses
   */
  abstract getDuration(): number;

  /**
   * Get display information for the item
   * Must be implemented by subclasses
   */
  abstract getDisplayInfo(): string;

  /**
   * Validate the item data
   * Must be implemented by subclasses
   */
  abstract validate(): { isValid: boolean; errors: string[] };

  /**
   * Check if this item overlaps with another item
   * @param other - Another itinerary item
   * @returns True if items overlap in time
   */
  isOverlapping(other: ItineraryItemBase): boolean {
    return (
      (this.startDate < other.endDate && this.endDate > other.startDate) ||
      (other.startDate < this.endDate && other.endDate > this.startDate)
    );
  }

  /**
   * Get time until the item starts (in milliseconds)
   * @returns Time in milliseconds (negative if already started)
   */
  getTimeUntilStart(): number {
    return this.startDate.getTime() - Date.now();
  }

  /**
   * Check if the item has started
   * @returns True if start date has passed
   */
  hasStarted(): boolean {
    return Date.now() >= this.startDate.getTime();
  }

  /**
   * Check if the item has ended
   * @returns True if end date has passed
   */
  hasEnded(): boolean {
    return Date.now() >= this.endDate.getTime();
  }

  /**
   * Check if the item is currently active
   * @returns True if current time is between start and end dates
   */
  isActive(): boolean {
    const now = Date.now();
    return now >= this.startDate.getTime() && now <= this.endDate.getTime();
  }

  /**
   * Get status of the item
   * @returns Status string: 'active', 'completed', or 'upcoming'
   */
  getStatus(): 'active' | 'completed' | 'upcoming' {
    if (this.hasEnded()) return 'completed';
    if (this.hasStarted()) return 'active';
    return 'upcoming';
  }

  /**
   * Get formatted date range string
   * @returns Formatted date range
   */
  getDateRangeString(): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
    
    const start = this.startDate.toLocaleDateString('en-US', options);
    const end = this.endDate.toLocaleDateString('en-US', options);

    return `${start} - ${end}`;
  }

  /**
   * Get duration in hours
   * @returns Duration in hours
   */
  getDurationHours(): number {
    return Math.floor(this.getDuration() / 60);
  }

  /**
   * Get formatted duration string
   * @returns Formatted duration (e.g., "2h 30m")
   */
  getFormattedDuration(): string {
    const minutes = this.getDuration();
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    }
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
  }

  /**
   * Check if item duration is longer than specified hours
   * @param hours - Number of hours to compare
   * @returns True if duration exceeds specified hours
   */
  isLongerThan(hours: number): boolean {
    return this.getDuration() > hours * 60;
  }

  /**
   * Create a deep copy of the item
   * Must be implemented by subclasses
   */
  abstract clone(): ItineraryItemBase;
}
