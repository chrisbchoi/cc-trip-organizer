import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../../../../core/models/trip.model';
import { DateFormatPipe } from '../../../../shared/pipes';

/**
 * Trip Card Component
 *
 * Displays an individual trip as a card with trip information and action buttons.
 * This is a presentation component that emits events to parent components.
 *
 * Features:
 * - Displays trip title, dates, and description
 * - Select event for viewing trip details
 * - Delete event for removing the trip
 * - Hover effects and card styling
 * - Accessible with ARIA attributes
 *
 * Usage:
 * ```html
 * <app-trip-card
 *   [trip]="trip"
 *   (select)="onSelectTrip($event)"
 *   (delete)="onDeleteTrip($event)">
 * </app-trip-card>
 * ```
 */
@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  templateUrl: './trip-card.component.html',
  styleUrl: './trip-card.component.scss',
})
export class TripCardComponent {
  /**
   * The trip data to display
   */
  @Input({ required: true }) trip!: Trip;

  /**
   * Emits when the card is clicked to view trip details
   */
  @Output() select = new EventEmitter<string>();

  /**
   * Emits when the delete button is clicked
   */
  @Output() delete = new EventEmitter<string>();

  /**
   * Handle card click to select/view trip
   */
  onCardClick(): void {
    this.select.emit(this.trip.id);
  }

  /**
   * Handle delete button click
   * @param event - Click event to stop propagation
   */
  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.trip.id);
  }
}
