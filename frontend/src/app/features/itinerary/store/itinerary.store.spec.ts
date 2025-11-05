import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Flight } from '../../../core/models/flight.model';
import { Transport } from '../../../core/models/transport.model';
import { Accommodation } from '../../../core/models/accommodation.model';
import {
  ItineraryApiService,
  ItineraryItem,
  ItineraryGap,
} from '../services/itinerary-api.service';
import { ItineraryStore } from './itinerary.store';

describe('ItineraryStore', () => {
  let store: InstanceType<typeof ItineraryStore>;
  let itineraryApiService: jasmine.SpyObj<ItineraryApiService>;

  const mockLocation = {
    address: '123 Test St',
    city: 'Test City',
    country: 'Test Country',
    latitude: 0,
    longitude: 0,
  };

  // Mock itinerary items
  const mockFlight: Flight = new Flight({
    id: 'flight-1',
    type: 'flight',
    startDate: new Date('2025-07-01T10:00:00'),
    endDate: new Date('2025-07-01T14:00:00'),
    flightNumber: 'AA123',
    airline: 'Test Airlines',
    departureLocation: mockLocation,
    arrivalLocation: { ...mockLocation, city: 'Destination City' },
  });

  const mockTransport: Transport = new Transport({
    id: 'transport-1',
    type: 'transport',
    startDate: new Date('2025-07-02T09:00:00'),
    endDate: new Date('2025-07-02T11:00:00'),
    transportType: 'train',
    provider: 'Test Rail',
    departureLocation: mockLocation,
    arrivalLocation: { ...mockLocation, city: 'Next City' },
  });

  const mockAccommodation: Accommodation = new Accommodation({
    id: 'accommodation-1',
    type: 'accommodation',
    startDate: new Date('2025-07-01T15:00:00'),
    endDate: new Date('2025-07-02T10:00:00'),
    name: 'Test Hotel',
    location: mockLocation,
  });

  const mockGap: ItineraryGap = {
    startDateTime: '2025-07-01T14:00:00',
    endDateTime: '2025-07-01T15:00:00',
    durationHours: 1,
    suggestion: 'transport',
  };

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ItineraryApiService', [
      'getItems',
      'getGaps',
      'createFlight',
      'createTransport',
      'createAccommodation',
      'updateItem',
      'deleteItem',
      'reorderItem',
    ]);

    TestBed.configureTestingModule({
      providers: [ItineraryStore, { provide: ItineraryApiService, useValue: apiSpy }],
    });

    store = TestBed.inject(ItineraryStore);
    itineraryApiService = TestBed.inject(
      ItineraryApiService,
    ) as jasmine.SpyObj<ItineraryApiService>;
  });

  describe('Initial State', () => {
    it('should have empty items array', () => {
      expect(store.items()).toEqual([]);
    });

    it('should have empty gaps array', () => {
      expect(store.gaps()).toEqual([]);
    });

    it('should have no selected item', () => {
      expect(store.selectedItemId()).toBeNull();
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error', () => {
      expect(store.error()).toBeNull();
    });

    it('should have item count of 0', () => {
      expect(store.itemCount()).toBe(0);
    });

    it('should have gap count of 0', () => {
      expect(store.gapCount()).toBe(0);
    });

    it('should have hasGaps as false', () => {
      expect(store.hasGaps()).toBe(false);
    });
  });

  describe('loadItems', () => {
    it('should load items successfully', (done) => {
      itineraryApiService.getItems.and.returnValue(
        of([mockFlight, mockTransport, mockAccommodation]),
      );

      store.loadItems('trip-1');

      setTimeout(() => {
        expect(store.items().length).toBe(3);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });

    it('should handle error when loading items fails', (done) => {
      itineraryApiService.getItems.and.returnValue(throwError(() => new Error('Load failed')));

      store.loadItems('trip-1');

      setTimeout(() => {
        expect(store.items()).toEqual([]);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBe('Load failed');
        done();
      }, 10);
    });
  });

  describe('loadGaps', () => {
    it('should load gaps successfully', (done) => {
      itineraryApiService.getGaps.and.returnValue(of([mockGap]));

      store.loadGaps('trip-1');

      setTimeout(() => {
        expect(store.gaps().length).toBe(1);
        expect(store.gaps()[0].durationHours).toBe(1);
        done();
      }, 10);
    });

    it('should handle error when loading gaps fails', (done) => {
      itineraryApiService.getGaps.and.returnValue(throwError(() => new Error('Gap load failed')));

      // spy on console.error
      spyOn(console, 'error');

      store.loadGaps('trip-1');

      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to load gaps:', jasmine.any(Error));
        expect(store.gaps()).toEqual([]);
        done();
      }, 10);
    });
  });

  describe('selectItem', () => {
    beforeEach((done) => {
      itineraryApiService.getItems.and.returnValue(of([mockFlight, mockTransport]));
      store.loadItems('trip-1');
      setTimeout(done, 10);
    });

    it('should select an item by id', () => {
      store.selectItem('flight-1');

      expect(store.selectedItemId()).toBe('flight-1');
      expect(store.selectedItem()?.id).toBe('flight-1');
    });

    it('should return null when selecting non-existent item', () => {
      store.selectItem('non-existent');

      expect(store.selectedItemId()).toBe('non-existent');
      expect(store.selectedItem()).toBeNull();
    });

    it('should allow deselecting by passing null', () => {
      store.selectItem('flight-1');
      store.selectItem(null);

      expect(store.selectedItemId()).toBeNull();
      expect(store.selectedItem()).toBeNull();
    });
  });

  describe('createFlight', () => {
    beforeEach(() => {
      itineraryApiService.getGaps.and.returnValue(of([]));
    });

    it('should create a flight successfully', (done) => {
      const newFlight: Partial<Flight> = {
        flightNumber: 'BA456',
        airline: 'British Airways',
        startDate: new Date('2025-07-05T10:00:00'),
        endDate: new Date('2025-07-05T14:00:00'),
      };

      const createdFlight = new Flight({ ...newFlight, id: 'flight-2', type: 'flight' } as Flight);
      itineraryApiService.createFlight.and.returnValue(of(createdFlight));

      store.createFlight({ tripId: 'trip-1', flight: newFlight });

      setTimeout(() => {
        expect(store.items().length).toBe(1);
        expect(store.items()[0].id).toBe('flight-2');
        expect(store.selectedItemId()).toBe('flight-2');
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });

    it('should reload gaps after creating flight', (done) => {
      const newFlight: Partial<Flight> = {
        flightNumber: 'BA456',
      };

      const createdFlight = new Flight({ ...newFlight, id: 'flight-2', type: 'flight' } as Flight);
      itineraryApiService.createFlight.and.returnValue(of(createdFlight));
      itineraryApiService.getGaps.and.returnValue(of([mockGap]));

      store.createFlight({ tripId: 'trip-1', flight: newFlight });

      setTimeout(() => {
        expect(itineraryApiService.getGaps).toHaveBeenCalledWith('trip-1');
        done();
      }, 50);
    });

    it('should handle error when creating flight fails', (done) => {
      itineraryApiService.createFlight.and.returnValue(
        throwError(() => new Error('Create failed')),
      );

      store.createFlight({ tripId: 'trip-1', flight: {} });

      setTimeout(() => {
        expect(store.items().length).toBe(0);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBe('Create failed');
        done();
      }, 10);
    });
  });

  describe('createTransport', () => {
    beforeEach(() => {
      itineraryApiService.getGaps.and.returnValue(of([]));
    });

    it('should create a transport successfully', (done) => {
      const newTransport: Partial<Transport> = {
        transportType: 'bus',
        provider: 'Test Bus Co',
        startDate: new Date('2025-07-06T09:00:00'),
        endDate: new Date('2025-07-06T11:00:00'),
      };

      const createdTransport = new Transport({
        ...newTransport,
        id: 'transport-2',
        type: 'transport',
      } as Transport);
      itineraryApiService.createTransport.and.returnValue(of(createdTransport));

      store.createTransport({ tripId: 'trip-1', transport: newTransport });

      setTimeout(() => {
        expect(store.items().length).toBe(1);
        expect(store.items()[0].id).toBe('transport-2');
        expect(store.selectedItemId()).toBe('transport-2');
        expect(store.loading()).toBe(false);
        done();
      }, 10);
    });

    it('should handle error when creating transport fails', (done) => {
      itineraryApiService.createTransport.and.returnValue(
        throwError(() => new Error('Create failed')),
      );

      store.createTransport({ tripId: 'trip-1', transport: {} });

      setTimeout(() => {
        expect(store.items().length).toBe(0);
        expect(store.error()).toBe('Create failed');
        done();
      }, 10);
    });
  });

  describe('createAccommodation', () => {
    beforeEach(() => {
      itineraryApiService.getGaps.and.returnValue(of([]));
    });

    it('should create an accommodation successfully', (done) => {
      const newAccommodation: Partial<Accommodation> = {
        name: 'New Hotel',
        startDate: new Date('2025-07-07T15:00:00'),
        endDate: new Date('2025-07-08T10:00:00'),
      };

      const createdAccommodation = new Accommodation({
        ...newAccommodation,
        id: 'accommodation-2',
        type: 'accommodation',
      } as Accommodation);
      itineraryApiService.createAccommodation.and.returnValue(of(createdAccommodation));

      store.createAccommodation({ tripId: 'trip-1', accommodation: newAccommodation });

      setTimeout(() => {
        expect(store.items().length).toBe(1);
        expect(store.items()[0].id).toBe('accommodation-2');
        expect(store.selectedItemId()).toBe('accommodation-2');
        done();
      }, 10);
    });

    it('should handle error when creating accommodation fails', (done) => {
      itineraryApiService.createAccommodation.and.returnValue(
        throwError(() => new Error('Create failed')),
      );

      store.createAccommodation({ tripId: 'trip-1', accommodation: {} });

      setTimeout(() => {
        expect(store.items().length).toBe(0);
        expect(store.error()).toBe('Create failed');
        done();
      }, 10);
    });
  });

  describe('updateItem', () => {
    beforeEach((done) => {
      itineraryApiService.getItems.and.returnValue(of([mockFlight]));
      itineraryApiService.getGaps.and.returnValue(of([]));
      store.loadItems('trip-1');
      setTimeout(done, 10);
    });

    it('should update an item successfully', (done) => {
      const updates: Partial<ItineraryItem> = {
        startDate: new Date('2025-07-01T11:00:00'),
      };

      const updatedFlight = { ...mockFlight, startDate: new Date('2025-07-01T11:00:00') };
      itineraryApiService.updateItem.and.returnValue(of(updatedFlight as Flight));

      store.updateItem({ id: 'flight-1', updates, tripId: 'trip-1' });

      setTimeout(() => {
        const item = store.items().find((i) => i.id === 'flight-1');
        expect(item?.startDate).toEqual(new Date('2025-07-01T11:00:00'));
        expect(store.loading()).toBe(false);
        done();
      }, 10);
    });

    it('should reload gaps after updating item', (done) => {
      const updatedFlight = new Flight(mockFlight);
      itineraryApiService.updateItem.and.returnValue(of(updatedFlight));
      itineraryApiService.getGaps.and.returnValue(of([mockGap]));

      store.updateItem({ id: 'flight-1', updates: {}, tripId: 'trip-1' });

      setTimeout(() => {
        expect(itineraryApiService.getGaps).toHaveBeenCalledWith('trip-1');
        done();
      }, 50);
    });

    it('should handle error when updating item fails', (done) => {
      itineraryApiService.updateItem.and.returnValue(throwError(() => new Error('Update failed')));

      store.updateItem({ id: 'flight-1', updates: {}, tripId: 'trip-1' });

      setTimeout(() => {
        expect(store.error()).toBe('Update failed');
        done();
      }, 10);
    });
  });

  describe('deleteItem', () => {
    beforeEach((done) => {
      itineraryApiService.getItems.and.returnValue(of([mockFlight, mockTransport]));
      itineraryApiService.getGaps.and.returnValue(of([]));
      store.loadItems('trip-1');
      setTimeout(done, 10);
    });

    it('should delete an item successfully', (done) => {
      itineraryApiService.deleteItem.and.returnValue(of(void 0));

      store.deleteItem({ itemId: 'flight-1', tripId: 'trip-1' });

      setTimeout(() => {
        expect(store.items().length).toBe(1);
        expect(store.items()[0].id).toBe('transport-1');
        expect(store.loading()).toBe(false);
        done();
      }, 10);
    });

    it('should clear selectedItemId if deleted item was selected', (done) => {
      store.selectItem('flight-1');
      itineraryApiService.deleteItem.and.returnValue(of(void 0));

      store.deleteItem({ itemId: 'flight-1', tripId: 'trip-1' });

      setTimeout(() => {
        expect(store.selectedItemId()).toBeNull();
        done();
      }, 10);
    });

    it('should reload gaps after deleting item', (done) => {
      itineraryApiService.deleteItem.and.returnValue(of(void 0));
      itineraryApiService.getGaps.and.returnValue(of([]));

      store.deleteItem({ itemId: 'flight-1', tripId: 'trip-1' });

      setTimeout(() => {
        expect(itineraryApiService.getGaps).toHaveBeenCalledWith('trip-1');
        done();
      }, 50);
    });

    it('should handle error when deleting item fails', (done) => {
      itineraryApiService.deleteItem.and.returnValue(throwError(() => new Error('Delete failed')));

      store.deleteItem({ itemId: 'flight-1', tripId: 'trip-1' });

      setTimeout(() => {
        expect(store.items().length).toBe(2); // Still has both items
        expect(store.error()).toBe('Delete failed');
        done();
      }, 10);
    });
  });

  describe('reorderItem', () => {
    beforeEach((done) => {
      itineraryApiService.getItems.and.returnValue(of([mockFlight]));
      itineraryApiService.getGaps.and.returnValue(of([]));
      store.loadItems('trip-1');
      setTimeout(done, 10);
    });

    it('should reorder an item successfully', (done) => {
      const newDate = new Date('2025-07-02T10:00:00');
      const reorderedFlight = new Flight({ ...mockFlight, startDate: newDate });
      itineraryApiService.reorderItem.and.returnValue(of(reorderedFlight));

      store.reorderItem({ itemId: 'flight-1', newDate, tripId: 'trip-1' });

      setTimeout(() => {
        const item = store.items().find((i) => i.id === 'flight-1');
        expect(item?.startDate).toEqual(newDate);
        expect(store.loading()).toBe(false);
        done();
      }, 10);
    });

    it('should reload gaps after reordering', (done) => {
      const reorderedFlight = new Flight(mockFlight);
      itineraryApiService.reorderItem.and.returnValue(of(reorderedFlight));
      itineraryApiService.getGaps.and.returnValue(of([mockGap]));

      store.reorderItem({ itemId: 'flight-1', newDate: new Date(), tripId: 'trip-1' });

      setTimeout(() => {
        expect(itineraryApiService.getGaps).toHaveBeenCalledWith('trip-1');
        done();
      }, 50);
    });

    it('should handle error when reordering fails', (done) => {
      itineraryApiService.reorderItem.and.returnValue(
        throwError(() => new Error('Reorder failed')),
      );

      store.reorderItem({ itemId: 'flight-1', newDate: new Date(), tripId: 'trip-1' });

      setTimeout(() => {
        expect(store.error()).toBe('Reorder failed');
        done();
      }, 10);
    });
  });

  describe('Computed Signals', () => {
    beforeEach((done) => {
      itineraryApiService.getItems.and.returnValue(
        of([mockFlight, mockTransport, mockAccommodation]),
      );
      itineraryApiService.getGaps.and.returnValue(of([mockGap]));
      store.loadItems('trip-1');
      store.loadGaps('trip-1');
      setTimeout(done, 10);
    });

    it('should compute itemCount correctly', () => {
      expect(store.itemCount()).toBe(3);
    });

    it('should compute gapCount correctly', () => {
      expect(store.gapCount()).toBe(1);
    });

    it('should compute hasGaps correctly', () => {
      expect(store.hasGaps()).toBe(true);
    });

    it('should filter flights correctly', () => {
      const flights = store.flights();
      expect(flights.length).toBe(1);
      expect(flights[0].type).toBe('flight');
    });

    it('should filter transports correctly', () => {
      const transports = store.transports();
      expect(transports.length).toBe(1);
      expect(transports[0].type).toBe('transport');
    });

    it('should filter accommodations correctly', () => {
      const accommodations = store.accommodations();
      expect(accommodations.length).toBe(1);
      expect(accommodations[0].type).toBe('accommodation');
    });

    it('should sort items chronologically', () => {
      const sorted = store.sortedItems();
      expect(sorted[0].id).toBe('flight-1'); // 10:00
      expect(sorted[1].id).toBe('accommodation-1'); // 15:00 (same day)
      expect(sorted[2].id).toBe('transport-1'); // next day
    });

    it('should compute selectedItem correctly', () => {
      store.selectItem('flight-1');
      expect(store.selectedItem()?.id).toBe('flight-1');
      expect(store.selectedItem()?.type).toBe('flight');
    });
  });

  describe('Utility Methods', () => {
    it('should clear error', (done) => {
      itineraryApiService.getItems.and.returnValue(throwError(() => new Error('Test error')));
      store.loadItems('trip-1');

      setTimeout(() => {
        expect(store.error()).toBeTruthy();

        store.clearError();
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });

    it('should reset store to initial state', (done) => {
      itineraryApiService.getItems.and.returnValue(of([mockFlight]));
      store.loadItems('trip-1');

      setTimeout(() => {
        store.selectItem('flight-1');

        store.reset();

        expect(store.items()).toEqual([]);
        expect(store.gaps()).toEqual([]);
        expect(store.selectedItemId()).toBeNull();
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array in computed signals', () => {
      expect(store.itemCount()).toBe(0);
      expect(store.flights()).toEqual([]);
      expect(store.transports()).toEqual([]);
      expect(store.accommodations()).toEqual([]);
      expect(store.sortedItems()).toEqual([]);
    });

    it('should handle API returning empty array', (done) => {
      itineraryApiService.getItems.and.returnValue(of([]));

      store.loadItems('trip-1');

      setTimeout(() => {
        expect(store.items()).toEqual([]);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        done();
      }, 10);
    });

    it('should handle error without message', (done) => {
      itineraryApiService.getItems.and.returnValue(throwError(() => new Error()));

      store.loadItems('trip-1');

      setTimeout(() => {
        expect(store.error()).toBe('Failed to load itinerary items');
        done();
      }, 10);
    });

    it('should handle gaps loading failure gracefully', (done) => {
      itineraryApiService.getGaps.and.returnValue(throwError(() => new Error()));
      spyOn(console, 'error');

      store.loadGaps('trip-1');

      setTimeout(() => {
        expect(store.gaps()).toEqual([]);
        done();
      }, 10);
    });
  });
});
