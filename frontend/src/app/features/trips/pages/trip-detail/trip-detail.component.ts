import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TripsStore } from '../../store/trips.store';
import { ItineraryStore } from '../../../itinerary/store/itinerary.store';
import { TripsApiService } from '../../services/trips-api.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { TripMapViewComponent } from '../../../maps/components/trip-map-view/trip-map-view.component';
import { Trip } from '../../../../core/models/trip.model';
import { Flight } from '../../../../core/models/flight.model';
import { Transport } from '../../../../core/models/transport.model';
import { Accommodation } from '../../../../core/models/accommodation.model';
import { formatDate } from '../../../../core/utils/date.utils';
import { ItineraryItem } from '../../../itinerary/services/itinerary-api.service';

/**
 * TripDetailComponent
 *
 * Smart container component that displays detailed information about a specific trip
 * including its itinerary items.
 *
 * Features:
 * - Loads trip by ID from route params
 * - Displays trip header with title, dates, and duration
 * - Shows itinerary items timeline
 * - "Edit Trip" button to modify trip details
 * - "Add Item" button to create new itinerary items
 * - Loading and error state handling
 * - 404 handling for invalid trip IDs
 *
 * Usage:
 * This is a routed page component accessed at '/trips/:id'
 */
@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, TripMapViewComponent],
  templateUrl: './trip-detail.component.html',
  styleUrl: './trip-detail.component.scss',
})
export class TripDetailComponent implements OnInit {
  /**
   * Current trip ID from route params
   */
  tripId: string | null = null;

  /**
   * Flag to track if initial load has been attempted
   */
  private hasLoadedData = false;

  /**
   * View mode: 'timeline' or 'map'
   */
  viewMode: 'timeline' | 'map' = 'timeline';

  /**
   * Inject TripsStore for state management
   */
  readonly tripsStore = inject(TripsStore);

  /**
   * Inject ItineraryStore for itinerary state management
   */
  readonly itineraryStore = inject(ItineraryStore);

  /**
   * Inject TripsApiService for export functionality
   */
  private tripsApiService = inject(TripsApiService);

  /**
   * Inject ActivatedRoute to get route params
   */
  private route = inject(ActivatedRoute);

  /**
   * Inject Router for navigation
   */
  private router = inject(Router);

  ngOnInit(): void {
    // Get trip ID from route params
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.tripId = id;
        this.loadTripData(id);
      } else {
        // No ID provided, navigate back to dashboard
        this.router.navigate(['/trips']);
      }
    });
  }

  /**
   * Load trip and itinerary data
   */
  private loadTripData(tripId: string): void {
    if (!this.hasLoadedData) {
      // Select the trip in the store
      this.tripsStore.selectTrip(tripId);

      // Load trips if not already loaded
      if (this.tripsStore.trips().length === 0) {
        this.tripsStore.loadTrips();
      }

      // Load itinerary items for this trip
      this.itineraryStore.loadItems(tripId);

      // Load gaps for this trip
      this.itineraryStore.loadGaps(tripId);

      this.hasLoadedData = true;
    }
  }

  /**
   * Get the current trip from store
   */
  get trip(): Trip | null {
    return this.tripsStore.selectedTrip();
  }

  /**
   * Get loading state
   */
  get loading(): boolean {
    return this.tripsStore.loading() || this.itineraryStore.loading();
  }

  /**
   * Get error state
   */
  get error(): string | null {
    return this.tripsStore.error() || this.itineraryStore.error();
  }

  /**
   * Get itinerary items sorted chronologically
   */
  get itineraryItems() {
    return this.itineraryStore.sortedItems();
  }

  /**
   * Get detected gaps
   */
  get gaps() {
    return this.itineraryStore.gaps();
  }

  /**
   * Check if there are any itinerary items
   */
  get hasItems(): boolean {
    return this.itineraryItems.length > 0;
  }

  /**
   * Check if trip exists (not found)
   */
  get tripNotFound(): boolean {
    return !this.loading && !this.trip && this.hasLoadedData;
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return formatDate(date, 'medium');
  }

  /**
   * Navigate to edit trip page
   */
  onEditTrip(): void {
    if (this.tripId) {
      this.router.navigate(['/trips', this.tripId, 'edit']);
    }
  }

  /**
   * Navigate to add itinerary item page
   */
  onAddItem(): void {
    if (this.tripId) {
      this.router.navigate(['/trips', this.tripId, 'items', 'new']);
    }
  }

  /**
   * Navigate to edit itinerary item
   */
  onEditItem(itemId: string): void {
    if (this.tripId) {
      this.router.navigate(['/trips', this.tripId, 'items', itemId, 'edit']);
    }
  }

  /**
   * Navigate back to trips dashboard
   */
  onBackToTrips(): void {
    this.router.navigate(['/trips']);
  }

  /**
   * Retry loading trip data after an error
   */
  onRetry(): void {
    this.hasLoadedData = false;
    if (this.tripId) {
      this.loadTripData(this.tripId);
    }
  }

  /**
   * Type guard to check if item is a Flight
   */
  isFlight(item: ItineraryItem): item is Flight {
    return item.type === 'flight';
  }

  /**
   * Type guard to check if item is a Transport
   */
  isTransport(item: ItineraryItem): item is Transport {
    return item.type === 'transport';
  }

  /**
   * Type guard to check if item is an Accommodation
   */
  isAccommodation(item: ItineraryItem): item is Accommodation {
    return item.type === 'accommodation';
  }

  /**
   * Convert item to Flight (with type assertion)
   */
  asFlight(item: ItineraryItem): Flight {
    return item as Flight;
  }

  /**
   * Convert item to Transport (with type assertion)
   */
  asTransport(item: ItineraryItem): Transport {
    return item as Transport;
  }

  /**
   * Convert item to Accommodation (with type assertion)
   */
  asAccommodation(item: ItineraryItem): Accommodation {
    return item as Accommodation;
  }

  /**
   * Toggle between timeline and map view
   */
  toggleView(): void {
    this.viewMode = this.viewMode === 'timeline' ? 'map' : 'timeline';
  }

  /**
   * Check if current view is timeline
   */
  get isTimelineView(): boolean {
    return this.viewMode === 'timeline';
  }

  /**
   * Check if current view is map
   */
  get isMapView(): boolean {
    return this.viewMode === 'map';
  }

  /**
   * Export trip data as JSON file
   */
  onExportToJson(): void {
    if (!this.tripId) {
      return;
    }

    const trip = this.tripsStore.selectedTrip();
    if (!trip) {
      return;
    }

    this.tripsApiService.exportTripToJson(this.tripId).subscribe({
      next: (exportData) => {
        // Create a blob from the JSON data
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename: trip-title-date.json
        const sanitizedTitle = trip.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const dateStr = trip.startDate.toISOString().split('T')[0];
        link.download = `trip-${sanitizedTitle}-${dateStr}.json`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting trip:', error);
        // You might want to show a notification here
      },
    });
  }
}
