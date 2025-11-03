import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryItem, ItineraryGap } from '../../services/itinerary-api.service';
import { Flight } from '../../../../core/models/flight.model';
import { Transport } from '../../../../core/models/transport.model';
import { Accommodation } from '../../../../core/models/accommodation.model';
import { formatDate } from '../../../../core/utils/date.utils';

/**
 * Interface for grouped itinerary items by date
 */
interface GroupedItems {
  date: Date;
  dateLabel: string;
  items: ItineraryItem[];
}

/**
 * ItineraryTimelineComponent
 *
 * Presentation component that displays itinerary items in a visual timeline
 * grouped by date with gap indicators.
 *
 * Features:
 * - Groups items chronologically by date
 * - Displays items with color coding by type
 * - Shows gap indicators between items
 * - Emits click events for item editing
 * - Responsive design
 *
 * Usage:
 * <app-itinerary-timeline
 *   [items]="itineraryItems"
 *   [gaps]="detectedGaps"
 *   (itemClick)="onItemClick($event)">
 * </app-itinerary-timeline>
 */
@Component({
  selector: 'app-itinerary-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './itinerary-timeline.component.html',
  styleUrl: './itinerary-timeline.component.scss',
})
export class ItineraryTimelineComponent {
  /**
   * Array of itinerary items to display
   */
  @Input() items: ItineraryItem[] = [];

  /**
   * Array of detected gaps between items
   */
  @Input() gaps: ItineraryGap[] = [];

  /**
   * Event emitted when an item is clicked for editing
   */
  @Output() itemClick = new EventEmitter<ItineraryItem>();

  /**
   * Group items by date for display
   * @returns Array of grouped items by date
   */
  get groupedItems(): GroupedItems[] {
    if (!this.items || this.items.length === 0) {
      return [];
    }

    // Sort items chronologically
    const sortedItems = [...this.items].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );

    // Group by date
    const groups = new Map<string, GroupedItems>();

    sortedItems.forEach((item) => {
      const dateKey = this.getDateKey(item.startDate);

      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          date: this.getStartOfDay(item.startDate),
          dateLabel: this.formatDateLabel(item.startDate),
          items: [],
        });
      }

      groups.get(dateKey)!.items.push(item);
    });

    return Array.from(groups.values());
  }

  /**
   * Get a date key for grouping (YYYY-MM-DD)
   */
  private getDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get start of day for a given date
   */
  private getStartOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  /**
   * Format date label for display (e.g., "Monday, January 15, 2024")
   */
  private formatDateLabel(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Format time for display (e.g., "2:30 PM")
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Format date and time for display
   */
  formatDateTime(date: Date): string {
    return formatDate(date, 'short');
  }

  /**
   * Get CSS class for item type
   */
  getItemTypeClass(item: ItineraryItem): string {
    return `item-type-${item.type}`;
  }

  /**
   * Get icon for item type
   */
  getItemIcon(item: ItineraryItem): string {
    const iconMap: Record<string, string> = {
      flight: '✈️',
      transport: '🚗',
      accommodation: '🏨',
    };
    return iconMap[item.type] || '📍';
  }

  /**
   * Get type label for display
   */
  getItemTypeLabel(item: ItineraryItem): string {
    const labelMap: Record<string, string> = {
      flight: 'Flight',
      transport: 'Transport',
      accommodation: 'Accommodation',
    };
    return labelMap[item.type] || item.type;
  }

  /**
   * Handle item click
   */
  onItemClick(item: ItineraryItem): void {
    this.itemClick.emit(item);
  }

  /**
   * Type guard for Flight
   */
  isFlight(item: ItineraryItem): item is Flight {
    return item.type === 'flight';
  }

  /**
   * Type guard for Transport
   */
  isTransport(item: ItineraryItem): item is Transport {
    return item.type === 'transport';
  }

  /**
   * Type guard for Accommodation
   */
  isAccommodation(item: ItineraryItem): item is Accommodation {
    return item.type === 'accommodation';
  }

  /**
   * Cast to Flight
   */
  asFlight(item: ItineraryItem): Flight {
    return item as Flight;
  }

  /**
   * Cast to Transport
   */
  asTransport(item: ItineraryItem): Transport {
    return item as Transport;
  }

  /**
   * Cast to Accommodation
   */
  asAccommodation(item: ItineraryItem): Accommodation {
    return item as Accommodation;
  }

  /**
   * Get title for item
   */
  getItemTitle(item: ItineraryItem): string {
    if (this.isFlight(item)) {
      const flight = this.asFlight(item);
      return `${flight.departureLocation.address} → ${flight.arrivalLocation.address}`;
    } else if (this.isTransport(item)) {
      const transport = this.asTransport(item);
      return `${transport.departureLocation.address} → ${transport.arrivalLocation.address}`;
    } else if (this.isAccommodation(item)) {
      const accommodation = this.asAccommodation(item);
      return accommodation.name;
    }
    return 'Untitled';
  }

  /**
   * Get subtitle for item
   */
  getItemSubtitle(item: ItineraryItem): string {
    if (this.isFlight(item)) {
      const flight = this.asFlight(item);
      return flight.flightNumber ? `Flight ${flight.flightNumber}` : '';
    } else if (this.isTransport(item)) {
      const transport = this.asTransport(item);
      return transport.transportType || '';
    } else if (this.isAccommodation(item)) {
      const accommodation = this.asAccommodation(item);
      return accommodation.location.address;
    }
    return '';
  }

  /**
   * Check if there's a gap after an item
   */
  hasGapAfter(item: ItineraryItem): boolean {
    return this.gaps.some((gap) => {
      // Check if gap occurs after this item
      // Since ItineraryGap has startDateTime and endDateTime
      const itemEndTime = item.endDate.getTime();
      const gapStartTime = new Date(gap.startDateTime).getTime();

      // Gap should start shortly after item ends
      return Math.abs(gapStartTime - itemEndTime) < 60000; // Within 1 minute
    });
  }

  /**
   * Get gap details after an item
   */
  getGapAfter(item: ItineraryItem): ItineraryGap | undefined {
    return this.gaps.find((gap) => {
      const itemEndTime = item.endDate.getTime();
      const gapStartTime = new Date(gap.startDateTime).getTime();
      return Math.abs(gapStartTime - itemEndTime) < 60000;
    });
  }

  /**
   * Format gap start time
   */
  formatGapStart(gap: ItineraryGap): string {
    return this.formatDateTime(new Date(gap.startDateTime));
  }

  /**
   * Format gap end time
   */
  formatGapEnd(gap: ItineraryGap): string {
    return this.formatDateTime(new Date(gap.endDateTime));
  }
}
