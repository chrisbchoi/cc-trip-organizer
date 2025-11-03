import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TripsStore } from '../../store/trips.store';
import { ConfirmationDialogComponent, LoadingSpinnerComponent } from '../../../../shared/components';
import { DateFormatPipe } from '../../../../shared/pipes';

/**
 * Trip List Component
 * 
 * Displays a list of all trips in a grid layout with options to view, edit, and delete.
 * Shows an empty state when no trips exist.
 * Uses the TripsStore for state management and includes confirmation dialogs for destructive actions.
 * 
 * Features:
 * - Displays trips in a responsive grid
 * - Shows trip title, dates, and itinerary item count
 * - Click to navigate to trip detail view
 * - Delete with confirmation dialog
 * - Empty state message when no trips
 * - Loading state support
 */
@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent, LoadingSpinnerComponent, DateFormatPipe],
  templateUrl: './trip-list.component.html',
  styleUrl: './trip-list.component.scss',
})
export class TripListComponent implements OnInit {
  readonly tripsStore = inject(TripsStore);
  private readonly router = inject(Router);

  // Expose store signals to template
  trips = this.tripsStore.trips;
  loading = this.tripsStore.loading;
  error = this.tripsStore.error;

  // Confirmation dialog state
  showDeleteConfirmation = false;
  tripToDelete: string | null = null;
  tripNameToDelete = '';

  ngOnInit(): void {
    // Load trips on component initialization
    this.tripsStore.loadTrips();
  }

  /**
   * Navigate to trip detail view
   * @param tripId - ID of the trip to view
   */
  onViewTrip(tripId: string): void {
    this.router.navigate(['/trips', tripId]);
  }

  /**
   * Open confirmation dialog for trip deletion
   * @param tripId - ID of the trip to delete
   * @param tripTitle - Title of the trip (for confirmation message)
   * @param event - Click event (to prevent navigation)
   */
  onDeleteTrip(tripId: string, tripTitle: string, event: Event): void {
    event.stopPropagation(); // Prevent card click navigation
    this.tripToDelete = tripId;
    this.tripNameToDelete = tripTitle;
    this.showDeleteConfirmation = true;
  }

  /**
   * Confirm trip deletion
   */
  onConfirmDelete(): void {
    if (this.tripToDelete) {
      this.tripsStore.deleteTrip(this.tripToDelete);
      this.closeDeleteDialog();
    }
  }

  /**
   * Cancel trip deletion
   */
  onCancelDelete(): void {
    this.closeDeleteDialog();
  }

  /**
   * Close the delete confirmation dialog
   */
  private closeDeleteDialog(): void {
    this.showDeleteConfirmation = false;
    this.tripToDelete = null;
    this.tripNameToDelete = '';
  }

  /**
   * Navigate to create new trip
   */
  onCreateTrip(): void {
    this.router.navigate(['/trips/new']);
  }
}
