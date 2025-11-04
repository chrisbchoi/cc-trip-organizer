/**
 * Trip model representing a travel itinerary
 */
export class Trip {
  id!: string;
  title!: string;
  description?: string;
  startDate!: Date;
  endDate!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data?: Partial<Trip>) {
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
   * Get the duration of the trip in days
   * @returns Number of days
   */
  getDuration(): number {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Check if the trip is currently active (today is between start and end dates)
   * @returns True if trip is active
   */
  isActive(): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(this.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(this.endDate);
    end.setHours(23, 59, 59, 999);

    return now >= start && now <= end;
  }

  /**
   * Check if the trip is in the past
   * @returns True if trip has ended
   */
  isPast(): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(this.endDate);
    end.setHours(23, 59, 59, 999);

    return now > end;
  }

  /**
   * Check if the trip is in the future
   * @returns True if trip hasn't started yet
   */
  isFuture(): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(this.startDate);
    start.setHours(0, 0, 0, 0);

    return now < start;
  }

  /**
   * Get trip status as a string
   * @returns Status string: 'active', 'past', or 'upcoming'
   */
  getStatus(): 'active' | 'past' | 'upcoming' {
    if (this.isActive()) return 'active';
    if (this.isPast()) return 'past';
    return 'upcoming';
  }

  /**
   * Get days until trip starts (negative if in past)
   * @returns Number of days
   */
  getDaysUntilStart(): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(this.startDate);
    start.setHours(0, 0, 0, 0);

    const diffTime = start.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days since trip ended (negative if not ended yet)
   * @returns Number of days
   */
  getDaysSinceEnd(): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(this.endDate);
    end.setHours(23, 59, 59, 999);

    const diffTime = now.getTime() - end.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Validate trip data
   * @returns Object with isValid flag and error messages
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (this.title && this.title.length > 255) {
      errors.push('Title must be 255 characters or less');
    }

    if (!this.startDate) {
      errors.push('Start date is required');
    }

    if (!this.endDate) {
      errors.push('End date is required');
    }

    if (this.startDate && this.endDate && this.endDate < this.startDate) {
      errors.push('End date must be after start date');
    }

    if (this.description && this.description.length > 2000) {
      errors.push('Description must be 2000 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get formatted date range string
   * @returns Formatted date range (e.g., "Jan 15 - Jan 22, 2024")
   */
  getDateRangeString(): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    const start = this.startDate.toLocaleDateString('en-US', options);
    const end = this.endDate.toLocaleDateString('en-US', options);
    const year = this.endDate.getFullYear();

    if (
      this.startDate.getFullYear() === this.endDate.getFullYear() &&
      this.startDate.getMonth() === this.endDate.getMonth()
    ) {
      // Same month and year
      return `${this.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${this.endDate.getDate()}, ${year}`;
    }

    return `${start} - ${end}, ${year}`;
  }

  /**
   * Create a deep copy of the trip
   * @returns New Trip instance
   */
  clone(): Trip {
    return new Trip({
      id: this.id,
      title: this.title,
      description: this.description,
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate),
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt),
    });
  }
}
