import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryItem } from '../../services/itinerary-api.service';
import { Flight } from '../../../../core/models/flight.model';
import { Transport } from '../../../../core/models/transport.model';
import { Accommodation } from '../../../../core/models/accommodation.model';

/**
 * Itinerary Item Component
 *
 * Displays a single itinerary item (flight, transport, or accommodation)
 * with type-specific information and action buttons.
 *
 * Features:
 * - Type-specific views for each item type
 * - Color-coded borders by type
 * - Edit and delete actions
 * - Time and location display
 * - Duration calculation
 */
@Component({
  selector: 'app-itinerary-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './itinerary-item.component.html',
  styleUrl: './itinerary-item.component.scss',
})
export class ItineraryItemComponent {
  @Input({ required: true }) item!: ItineraryItem;
  @Output() edit = new EventEmitter<ItineraryItem>();
  @Output() delete = new EventEmitter<ItineraryItem>();

  /**
   * Type guard to check if item is a Flight
   */
  isFlight(item: ItineraryItem): item is Flight {
    return item.type === 'flight';
  }

  /**
   * Type guard to check if item is Transport
   */
  isTransport(item: ItineraryItem): item is Transport {
    return item.type === 'transport';
  }

  /**
   * Type guard to check if item is Accommodation
   */
  isAccommodation(item: ItineraryItem): item is Accommodation {
    return item.type === 'accommodation';
  }

  /**
   * Cast item to Flight type (use with isFlight guard)
   */
  asFlight(item: ItineraryItem): Flight {
    return item as Flight;
  }

  /**
   * Cast item to Transport type (use with isTransport guard)
   */
  asTransport(item: ItineraryItem): Transport {
    return item as Transport;
  }

  /**
   * Cast item to Accommodation type (use with isAccommodation guard)
   */
  asAccommodation(item: ItineraryItem): Accommodation {
    return item as Accommodation;
  }

  /**
   * Get CSS class for item type (for color coding)
   */
  getItemTypeClass(): string {
    return `item-type-${this.item.type}`;
  }

  /**
   * Get icon for item type
   */
  getItemIcon(): string {
    switch (this.item.type) {
      case 'flight':
        return '✈️';
      case 'transport':
        return '🚗';
      case 'accommodation':
        return '🏨';
      default:
        return '📍';
    }
  }

  /**
   * Get type label for display
   */
  getItemTypeLabel(): string {
    switch (this.item.type) {
      case 'flight':
        return 'Flight';
      case 'transport':
        return 'Transport';
      case 'accommodation':
        return 'Accommodation';
      default:
        return 'Item';
    }
  }

  /**
   * Format date and time for display
   */
  formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Format time only for display
   */
  formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Format duration in hours and minutes
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  }

  /**
   * Format location for display
   */
  formatLocation(location: { address: string; city?: string; country?: string }): string {
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    } else if (location.city) {
      return location.city;
    } else {
      return location.address;
    }
  }

  /**
   * Get departure label based on item type
   */
  getDepartureLabel(): string {
    if (this.item.type === 'accommodation') {
      return 'Check-in';
    }
    return 'Departure';
  }

  /**
   * Get arrival label based on item type
   */
  getArrivalLabel(): string {
    if (this.item.type === 'accommodation') {
      return 'Check-out';
    }
    return 'Arrival';
  }

  /**
   * Handle edit button click
   */
  onEdit(): void {
    this.edit.emit(this.item);
  }

  /**
   * Handle delete button click
   */
  onDelete(): void {
    this.delete.emit(this.item);
  }
}
