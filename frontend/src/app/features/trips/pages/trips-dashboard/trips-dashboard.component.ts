import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TripsStore } from '../../store/trips.store';
import { TripListComponent } from '../../components/trip-list/trip-list.component';
import { TripFormComponent } from '../../components/trip-form/trip-form.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { Trip } from '../../../../core/models/trip.model';

/**
 * TripsDashboardComponent
 *
 * Smart container component that displays the main trips dashboard.
 * Manages trip creation, viewing, and deletion flows.
 *
 * Features:
 * - Displays all trips using TripListComponent
 * - "Create New Trip" button with form dialog
 * - Trip selection navigation to detail page
 * - Trip deletion with confirmation
 * - Loading and error state handling
 * - Integrates with TripsStore for state management
 *
 * Usage:
 * This is a routed page component accessed at '/trips' or root path.
 */
@Component({
  selector: 'app-trips-dashboard',
  standalone: true,
  imports: [CommonModule, TripListComponent, TripFormComponent, LoadingSpinnerComponent],
  templateUrl: './trips-dashboard.component.html',
  styleUrl: './trips-dashboard.component.scss',
})
export class TripsDashboardComponent implements OnInit {
  /**
   * Flag to show/hide the trip creation form dialog
   */
  showCreateForm = false;

  /**
   * Flag to track if initial load has been attempted
   */
  private hasLoadedTrips = false;

  /**
   * Inject TripsStore for state management
   */
  readonly tripsStore = inject(TripsStore);

  /**
   * Inject Router for navigation
   */
  private router = inject(Router);

  ngOnInit(): void {
    // Load trips on initialization if not already loaded
    if (!this.hasLoadedTrips) {
      this.loadTrips();
      this.hasLoadedTrips = true;
    }
  }

  /**
   * Load all trips from the store
   */
  loadTrips(): void {
    this.tripsStore.loadTrips();
  }

  /**
   * Show the create trip form dialog
   */
  onCreateTrip(): void {
    this.showCreateForm = true;
  }

  /**
   * Handle trip creation from form submission
   */
  onSaveTrip(tripData: Partial<Trip>): void {
    this.tripsStore.createTrip(tripData);
    this.showCreateForm = false;
  }

  /**
   * Handle form cancellation
   */
  onCancelCreate(): void {
    this.showCreateForm = false;
  }

  /**
   * Check if there are any trips
   */
  get hasTrips(): boolean {
    return this.tripsStore.trips().length > 0;
  }

  /**
   * Get the loading state from store
   */
  get loading(): boolean {
    return this.tripsStore.loading();
  }

  /**
   * Get the error state from store
   */
  get error(): string | null {
    return this.tripsStore.error();
  }

  /**
   * Retry loading trips after an error
   */
  onRetry(): void {
    this.loadTrips();
  }
}
