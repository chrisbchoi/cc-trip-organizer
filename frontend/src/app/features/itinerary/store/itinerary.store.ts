import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { Flight } from '../../../core/models/flight.model';
import { Transport } from '../../../core/models/transport.model';
import { Accommodation } from '../../../core/models/accommodation.model';
import {
  ItineraryApiService,
  ItineraryItem,
  ItineraryGap,
} from '../services/itinerary-api.service';

/**
 * State interface for Itinerary feature
 */
export interface ItineraryState {
  items: ItineraryItem[];
  gaps: ItineraryGap[];
  selectedItemId: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial state for Itinerary feature
 */
const initialState: ItineraryState = {
  items: [],
  gaps: [],
  selectedItemId: null,
  loading: false,
  error: null,
};

/**
 * Itinerary Store using NgRx Signals
 * Manages itinerary items, gaps, loading, error states, and CRUD operations
 */
export const ItineraryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items, gaps, selectedItemId }) => ({
    /**
     * Get the currently selected itinerary item
     */
    selectedItem: computed(() => {
      const id = selectedItemId();
      return id ? (items().find((item) => item.id === id) ?? null) : null;
    }),
    /**
     * Get total number of items
     */
    itemCount: computed(() => items().length),
    /**
     * Get items sorted chronologically by start date
     */
    sortedItems: computed(() =>
      [...items()].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
    ),
    /**
     * Get total number of gaps
     */
    gapCount: computed(() => gaps().length),
    /**
     * Get flights only
     */
    flights: computed(() => items().filter((item) => item.type === 'flight')),
    /**
     * Get transport items only
     */
    transports: computed(() => items().filter((item) => item.type === 'transport')),
    /**
     * Get accommodations only
     */
    accommodations: computed(() => items().filter((item) => item.type === 'accommodation')),
    /**
     * Check if there are any gaps
     */
    hasGaps: computed(() => gaps().length > 0),
  })),
  withMethods((store, itineraryApi = inject(ItineraryApiService)) => ({
    /**
     * Load all itinerary items for a trip
     * @param tripId Trip ID
     */
    loadItems: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((tripId) =>
          itineraryApi.getItems(tripId).pipe(
            map((items) => {
              patchState(store, { items, loading: false });
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to load itinerary items',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    /**
     * Load gaps for a trip
     * @param tripId Trip ID
     */
    loadGaps: rxMethod<string>(
      pipe(
        switchMap((tripId) =>
          itineraryApi.getGaps(tripId).pipe(
            map((gaps) => {
              patchState(store, { gaps });
            }),
            catchError((error: Error) => {
              console.error('Failed to load gaps:', error);
              return of(null);
            }),
          ),
        ),
      ),
    ),

    /**
     * Select an itinerary item by ID
     * @param itemId Item ID to select
     */
    selectItem(itemId: string | null): void {
      patchState(store, { selectedItemId: itemId });
    },

    /**
     * Create a new flight
     * @param tripId Trip ID
     * @param flight Partial flight data
     */
    createFlight: rxMethod<{ tripId: string; flight: Partial<Flight> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ tripId, flight }) =>
          itineraryApi.createFlight(tripId, flight).pipe(
            map((newFlight) => {
              patchState(store, {
                items: [...store.items(), newFlight],
                loading: false,
                selectedItemId: newFlight.id,
              });
              // Reload gaps after adding item
              itineraryApi
                .getGaps(tripId)
                .pipe(
                  map((gaps) => patchState(store, { gaps })),
                  catchError(() => of(null)),
                )
                .subscribe();
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to create flight',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    /**
     * Create a new transport
     * @param tripId Trip ID
     * @param transport Partial transport data
     */
    createTransport: rxMethod<{ tripId: string; transport: Partial<Transport> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ tripId, transport }) =>
          itineraryApi.createTransport(tripId, transport).pipe(
            map((newTransport) => {
              patchState(store, {
                items: [...store.items(), newTransport],
                loading: false,
                selectedItemId: newTransport.id,
              });
              // Reload gaps after adding item
              itineraryApi
                .getGaps(tripId)
                .pipe(
                  map((gaps) => patchState(store, { gaps })),
                  catchError(() => of(null)),
                )
                .subscribe();
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to create transport',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    /**
     * Create a new accommodation
     * @param tripId Trip ID
     * @param accommodation Partial accommodation data
     */
    createAccommodation: rxMethod<{ tripId: string; accommodation: Partial<Accommodation> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ tripId, accommodation }) =>
          itineraryApi.createAccommodation(tripId, accommodation).pipe(
            map((newAccommodation) => {
              patchState(store, {
                items: [...store.items(), newAccommodation],
                loading: false,
                selectedItemId: newAccommodation.id,
              });
              // Reload gaps after adding item
              itineraryApi
                .getGaps(tripId)
                .pipe(
                  map((gaps) => patchState(store, { gaps })),
                  catchError(() => of(null)),
                )
                .subscribe();
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to create accommodation',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    /**
     * Update an existing itinerary item
     * @param id Item ID
     * @param updates Partial item data to update
     * @param tripId Trip ID (for gap reloading)
     */
    updateItem: rxMethod<{ id: string; updates: Partial<ItineraryItem>; tripId: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, updates, tripId }) =>
          itineraryApi.updateItem(id, updates).pipe(
            map((updatedItem) => {
              patchState(store, {
                items: store.items().map((item) => (item.id === id ? updatedItem : item)),
                loading: false,
              });
              // Reload gaps after updating item
              itineraryApi
                .getGaps(tripId)
                .pipe(
                  map((gaps) => patchState(store, { gaps })),
                  catchError(() => of(null)),
                )
                .subscribe();
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to update item',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    /**
     * Delete an itinerary item
     * @param itemId Item ID to delete
     * @param tripId Trip ID (for gap reloading)
     */
    deleteItem: rxMethod<{ itemId: string; tripId: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ itemId, tripId }) =>
          itineraryApi.deleteItem(itemId).pipe(
            map(() => {
              patchState(store, {
                items: store.items().filter((item) => item.id !== itemId),
                loading: false,
                selectedItemId: store.selectedItemId() === itemId ? null : store.selectedItemId(),
              });
              // Reload gaps after deleting item
              itineraryApi
                .getGaps(tripId)
                .pipe(
                  map((gaps) => patchState(store, { gaps })),
                  catchError(() => of(null)),
                )
                .subscribe();
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to delete item',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    /**
     * Reorder an itinerary item (drag-drop)
     * @param itemId Item ID
     * @param newDate New start date
     * @param tripId Trip ID (for gap reloading)
     */
    reorderItem: rxMethod<{ itemId: string; newDate: Date; tripId: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ itemId, newDate, tripId }) =>
          itineraryApi.reorderItem(itemId, newDate).pipe(
            map((updatedItem) => {
              patchState(store, {
                items: store.items().map((item) => (item.id === itemId ? updatedItem : item)),
                loading: false,
              });
              // Reload gaps after reordering
              itineraryApi
                .getGaps(tripId)
                .pipe(
                  map((gaps) => patchState(store, { gaps })),
                  catchError(() => of(null)),
                )
                .subscribe();
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to reorder item',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    /**
     * Clear any error messages
     */
    clearError(): void {
      patchState(store, { error: null });
    },

    /**
     * Reset the store to initial state
     */
    reset(): void {
      patchState(store, initialState);
    },
  })),
);
