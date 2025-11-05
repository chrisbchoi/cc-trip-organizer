import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Trip } from '../../../core/models/trip.model';
import { TripsApiService } from '../services/trips-api.service';
import { TripsStore } from './trips.store';

describe('TripsStore', () => {
  let store: InstanceType<typeof TripsStore>;
  let tripsApiService: jasmine.SpyObj<TripsApiService>;

  // Mock trips data
  const mockTrip1: Trip = new Trip({
    id: '1',
    title: 'Paris Vacation',
    description: 'Summer trip to Paris',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-10'),
  });

  const mockTrip2: Trip = new Trip({
    id: '2',
    title: 'Tokyo Adventure',
    description: 'Spring trip to Tokyo',
    startDate: new Date('2026-04-15'),
    endDate: new Date('2026-04-25'),
  });

  const mockTrip3: Trip = new Trip({
    id: '3',
    title: 'Past Trip',
    description: 'A completed trip',
    startDate: new Date('2020-01-01'),
    endDate: new Date('2020-01-10'),
  });

  const mockTrip4: Trip = new Trip({
    id: '4',
    title: 'Current Trip',
    description: 'Happening now',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  });

  beforeEach(() => {
    // Create spy object for TripsApiService
    const apiSpy = jasmine.createSpyObj('TripsApiService', [
      'getTrips',
      'createTrip',
      'updateTrip',
      'deleteTrip',
    ]);

    TestBed.configureTestingModule({
      providers: [TripsStore, { provide: TripsApiService, useValue: apiSpy }],
    });

    store = TestBed.inject(TripsStore);
    tripsApiService = TestBed.inject(TripsApiService) as jasmine.SpyObj<TripsApiService>;
  });

  describe('Initial State', () => {
    it('should have empty trips array', () => {
      expect(store.trips()).toEqual([]);
    });

    it('should have no selected trip', () => {
      expect(store.selectedTripId()).toBeNull();
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error', () => {
      expect(store.error()).toBeNull();
    });

    it('should have trip count of 0', () => {
      expect(store.tripCount()).toBe(0);
    });

    it('should have selectedTrip as null', () => {
      expect(store.selectedTrip()).toBeNull();
    });
  });

  describe('loadTrips', () => {
    it('should load trips successfully', (done) => {
      tripsApiService.getTrips.and.returnValue(of([mockTrip1, mockTrip2]));

      store.loadTrips();

      setTimeout(() => {
        expect(store.trips().length).toBe(2);
        expect(store.trips()[0].id).toBe('1');
        expect(store.trips()[1].id).toBe('2');
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });

    it('should handle error when loading trips fails', (done) => {
      const errorMessage = 'Network error';
      tripsApiService.getTrips.and.returnValue(throwError(() => new Error(errorMessage)));

      store.loadTrips();

      setTimeout(() => {
        expect(store.trips()).toEqual([]);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBe(errorMessage);
        done();
      }, 10);
    });

    it('should clear previous error when loading', (done) => {
      tripsApiService.getTrips.and.returnValue(throwError(() => new Error('First error')));
      store.loadTrips();

      setTimeout(() => {
        expect(store.error()).toBe('First error');

        tripsApiService.getTrips.and.returnValue(of([mockTrip1]));
        store.loadTrips();

        setTimeout(() => {
          expect(store.error()).toBeNull();
          expect(store.trips().length).toBe(1);
          done();
        }, 10);
      }, 10);
    });
  });

  describe('selectTrip', () => {
    beforeEach((done) => {
      tripsApiService.getTrips.and.returnValue(of([mockTrip1, mockTrip2]));
      store.loadTrips();
      setTimeout(done, 10);
    });

    it('should select a trip by id', () => {
      store.selectTrip('1');

      expect(store.selectedTripId()).toBe('1');
      expect(store.selectedTrip()?.id).toBe('1');
    });

    it('should return null when selecting non-existent trip', () => {
      store.selectTrip('999');

      expect(store.selectedTripId()).toBe('999');
      expect(store.selectedTrip()).toBeNull();
    });

    it('should allow deselecting by passing null', () => {
      store.selectTrip('1');
      store.selectTrip(null);

      expect(store.selectedTripId()).toBeNull();
      expect(store.selectedTrip()).toBeNull();
    });
  });

  describe('createTrip', () => {
    it('should create a new trip successfully', (done) => {
      const newTripData: Partial<Trip> = {
        title: 'New Trip',
        description: 'A new adventure',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-10'),
      };

      const createdTrip = new Trip({ ...newTripData, id: '5' } as Trip);
      tripsApiService.createTrip.and.returnValue(of(createdTrip));

      store.createTrip(newTripData);

      setTimeout(() => {
        expect(store.trips().length).toBe(1);
        expect(store.trips()[0].id).toBe('5');
        expect(store.selectedTripId()).toBe('5');
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });

    it('should handle error when creating trip fails', (done) => {
      const newTripData: Partial<Trip> = {
        title: 'New Trip',
      };

      tripsApiService.createTrip.and.returnValue(throwError(() => new Error('Failed to create')));

      store.createTrip(newTripData);

      setTimeout(() => {
        expect(store.trips().length).toBe(0);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBe('Failed to create');
        done();
      }, 10);
    });

    it('should add trip to existing trips array', (done) => {
      tripsApiService.getTrips.and.returnValue(of([mockTrip1]));
      store.loadTrips();

      setTimeout(() => {
        const newTrip = new Trip({ id: '6', title: 'Another Trip' } as Trip);
        tripsApiService.createTrip.and.returnValue(of(newTrip));

        store.createTrip({ title: 'Another Trip' });

        setTimeout(() => {
          expect(store.trips().length).toBe(2);
          expect(store.trips()[1].id).toBe('6');
          done();
        }, 10);
      }, 10);
    });
  });

  describe('updateTrip', () => {
    beforeEach((done) => {
      tripsApiService.getTrips.and.returnValue(of([mockTrip1, mockTrip2]));
      store.loadTrips();
      setTimeout(done, 10);
    });

    it('should update a trip successfully', (done) => {
      const updates: Partial<Trip> = {
        title: 'Updated Paris Trip',
        description: 'Modified description',
      };

      const updatedTrip = new Trip({ ...mockTrip1, ...updates });
      tripsApiService.updateTrip.and.returnValue(of(updatedTrip));

      store.updateTrip({ id: '1', updates });

      setTimeout(() => {
        const trip = store.trips().find((t) => t.id === '1');
        expect(trip?.title).toBe('Updated Paris Trip');
        expect(trip?.description).toBe('Modified description');
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });

    it('should handle error when updating trip fails', (done) => {
      tripsApiService.updateTrip.and.returnValue(throwError(() => new Error('Update failed')));

      store.updateTrip({ id: '1', updates: { title: 'New Title' } });

      setTimeout(() => {
        expect(store.loading()).toBe(false);
        expect(store.error()).toBe('Update failed');
        // Original trip should remain unchanged
        expect(store.trips()[0].title).toBe('Paris Vacation');
        done();
      }, 10);
    });

    it('should only update the specified trip', (done) => {
      const updatedTrip = new Trip({ ...mockTrip1, title: 'Updated' });
      tripsApiService.updateTrip.and.returnValue(of(updatedTrip));

      store.updateTrip({ id: '1', updates: { title: 'Updated' } });

      setTimeout(() => {
        expect(store.trips()[0].title).toBe('Updated');
        expect(store.trips()[1].title).toBe('Tokyo Adventure'); // Unchanged
        done();
      }, 10);
    });
  });

  describe('deleteTrip', () => {
    beforeEach((done) => {
      tripsApiService.getTrips.and.returnValue(of([mockTrip1, mockTrip2]));
      store.loadTrips();
      setTimeout(done, 10);
    });

    it('should delete a trip successfully', (done) => {
      tripsApiService.deleteTrip.and.returnValue(of(void 0));

      store.deleteTrip('1');

      setTimeout(() => {
        expect(store.trips().length).toBe(1);
        expect(store.trips()[0].id).toBe('2');
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });

    it('should handle error when deleting trip fails', (done) => {
      tripsApiService.deleteTrip.and.returnValue(throwError(() => new Error('Delete failed')));

      store.deleteTrip('1');

      setTimeout(() => {
        expect(store.trips().length).toBe(2); // Still has both trips
        expect(store.loading()).toBe(false);
        expect(store.error()).toBe('Delete failed');
        done();
      }, 10);
    });

    it('should clear selectedTripId if deleted trip was selected', (done) => {
      store.selectTrip('1');
      tripsApiService.deleteTrip.and.returnValue(of(void 0));

      store.deleteTrip('1');

      setTimeout(() => {
        expect(store.selectedTripId()).toBeNull();
        done();
      }, 10);
    });

    it('should keep selectedTripId if different trip was deleted', (done) => {
      store.selectTrip('2');
      tripsApiService.deleteTrip.and.returnValue(of(void 0));

      store.deleteTrip('1');

      setTimeout(() => {
        expect(store.selectedTripId()).toBe('2');
        done();
      }, 10);
    });
  });

  describe('Computed Signals', () => {
    beforeEach((done) => {
      tripsApiService.getTrips.and.returnValue(of([mockTrip1, mockTrip2, mockTrip3, mockTrip4]));
      store.loadTrips();
      setTimeout(done, 10);
    });

    it('should compute tripCount correctly', () => {
      expect(store.tripCount()).toBe(4);
    });

    it('should compute selectedTrip correctly', () => {
      store.selectTrip('1');
      expect(store.selectedTrip()?.title).toBe('Paris Vacation');
    });

    it('should filter active trips', () => {
      const active = store.activeTrips();
      expect(active.length).toBe(1);
      expect(active[0].id).toBe('4');
    });

    it('should filter upcoming trips', () => {
      const upcoming = store.upcomingTrips();
      expect(upcoming.length).toBe(2);
      expect(upcoming.some((t) => t.id === '1')).toBe(true);
      expect(upcoming.some((t) => t.id === '2')).toBe(true);
    });

    it('should filter past trips', () => {
      const past = store.pastTrips();
      expect(past.length).toBe(1);
      expect(past[0].id).toBe('3');
    });

    it('should sort trips by date (newest first)', () => {
      const sorted = store.tripsSortedByDate();
      expect(sorted[0].id).toBe('1'); // July 2025
      expect(sorted[1].id).toBe('2'); // April 2025
      expect(sorted[2].id).toBe('4'); // Current (started 5 days ago)
      expect(sorted[3].id).toBe('3'); // Jan 2020
    });
  });

  describe('Utility Methods', () => {
    it('should clear error', (done) => {
      tripsApiService.getTrips.and.returnValue(throwError(() => new Error('Test error')));
      store.loadTrips();

      setTimeout(() => {
        expect(store.error()).toBeTruthy();

        store.clearError();
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });

    it('should reset store to initial state', (done) => {
      tripsApiService.getTrips.and.returnValue(of([mockTrip1, mockTrip2]));
      store.loadTrips();

      setTimeout(() => {
        store.selectTrip('1');

        store.reset();

        expect(store.trips()).toEqual([]);
        expect(store.selectedTripId()).toBeNull();
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty trips array in computed signals', () => {
      expect(store.tripCount()).toBe(0);
      expect(store.activeTrips()).toEqual([]);
      expect(store.upcomingTrips()).toEqual([]);
      expect(store.pastTrips()).toEqual([]);
      expect(store.tripsSortedByDate()).toEqual([]);
    });

    it('should handle API returning empty array', (done) => {
      tripsApiService.getTrips.and.returnValue(of([]));

      store.loadTrips();

      setTimeout(() => {
        expect(store.trips()).toEqual([]);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });

    it('should handle error without message', (done) => {
      tripsApiService.getTrips.and.returnValue(throwError(() => new Error()));

      store.loadTrips();

      setTimeout(() => {
        expect(store.error()).toBe('Failed to load trips');
        done();
      }, 10);
    });
  });
});
