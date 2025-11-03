import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { Trip } from '../../../core/models/trip.model';
import { TripsApiService } from '../services/trips-api.service';

/**
 * State interface for Trips feature
 */
export interface TripsState {
  trips: Trip[];
  selectedTripId: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial state for Trips feature
 */
const initialState: TripsState = {
  trips: [],
  selectedTripId: null,
  loading: false,
  error: null,
};

/**
 * Trips Store using NgRx Signals
 * Manages trips data, loading, error states, and CRUD operations
 */
export const TripsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ trips, selectedTripId }) => ({
    /**
     * Get the currently selected trip
     */
    selectedTrip: computed(() => {
      const id = selectedTripId();
      return id ? (trips().find((trip) => trip.id === id) ?? null) : null;
    }),
    /**
     * Get total number of trips
     */
    tripCount: computed(() => trips().length),
    /**
     * Get active trips (currently happening)
     */
    activeTrips: computed(() => trips().filter((trip) => trip.isActive())),
    /**
     * Get upcoming trips (in the future)
     */
    upcomingTrips: computed(() => trips().filter((trip) => trip.isFuture())),
    /**
     * Get past trips
     */
    pastTrips: computed(() => trips().filter((trip) => trip.isPast())),
    /**
     * Get trips sorted by start date (newest first)
     */
    tripsSortedByDate: computed(() =>
      [...trips()].sort((a, b) => b.startDate.getTime() - a.startDate.getTime()),
    ),
  })),
  withMethods((store, tripsApi = inject(TripsApiService)) => ({
    /**
     * Load all trips from the API
     */
    loadTrips: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          tripsApi.getTrips().pipe(
            map((trips) => {
              patchState(store, { trips, loading: false });
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to load trips',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    /**
     * Select a trip by ID
     * @param tripId Trip ID to select
     */
    selectTrip(tripId: string | null): void {
      patchState(store, { selectedTripId: tripId });
    },

    /**
     * Create a new trip
     * @param trip Partial trip data
     */
    createTrip: rxMethod<Partial<Trip>>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((trip) =>
          tripsApi.createTrip(trip).pipe(
            map((newTrip) => {
              patchState(store, {
                trips: [...store.trips(), newTrip],
                loading: false,
                selectedTripId: newTrip.id,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to create trip',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    /**
     * Update an existing trip
     * @param id Trip ID
     * @param updates Partial trip data to update
     */
    updateTrip: rxMethod<{ id: string; updates: Partial<Trip> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, updates }) =>
          tripsApi.updateTrip(id, updates).pipe(
            map((updatedTrip) => {
              patchState(store, {
                trips: store.trips().map((trip) => (trip.id === id ? updatedTrip : trip)),
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to update trip',
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),

    /**
     * Delete a trip
     * @param tripId Trip ID to delete
     */
    deleteTrip: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((tripId) =>
          tripsApi.deleteTrip(tripId).pipe(
            map(() => {
              patchState(store, {
                trips: store.trips().filter((trip) => trip.id !== tripId),
                loading: false,
                selectedTripId: store.selectedTripId() === tripId ? null : store.selectedTripId(),
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to delete trip',
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
