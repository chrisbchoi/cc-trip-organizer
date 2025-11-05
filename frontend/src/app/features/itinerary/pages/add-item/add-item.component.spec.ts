import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';

import { AddItemComponent } from './add-item.component';
import { ItineraryStore } from '../../store/itinerary.store';
import { Flight } from '../../../../core/models/flight.model';
import { Transport } from '../../../../core/models/transport.model';
import { Accommodation } from '../../../../core/models/accommodation.model';

describe('AddItemComponent', () => {
  let component: AddItemComponent;
  let fixture: ComponentFixture<AddItemComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let paramMapSubject: BehaviorSubject<Map<string, string | null>>;
  let queryParamMapSubject: BehaviorSubject<Map<string, string | null>>;
  let mockActivatedRoute: {
    paramMap: BehaviorSubject<Map<string, string | null>>;
    queryParamMap: BehaviorSubject<Map<string, string | null>>;
  };
  let mockItineraryStore: {
    loading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    createFlight: jasmine.Spy;
    createTransport: jasmine.Spy;
    createAccommodation: jasmine.Spy;
  };

  beforeEach(async () => {
    // Create mock observables for route params
    paramMapSubject = new BehaviorSubject(new Map<string, string | null>([['tripId', 'trip-123']]));
    queryParamMapSubject = new BehaviorSubject(new Map<string, string | null>());

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      paramMap: paramMapSubject,
      queryParamMap: queryParamMapSubject,
    };

    mockItineraryStore = {
      loading: signal(false),
      error: signal(null),
      createFlight: jasmine.createSpy('createFlight'),
      createTransport: jasmine.createSpy('createTransport'),
      createAccommodation: jasmine.createSpy('createAccommodation'),
    };

    await TestBed.configureTestingModule({
      imports: [AddItemComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ItineraryStore, useValue: mockItineraryStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.tripId()).toBeNull();
      expect(component.itemId()).toBeNull();
      expect(component.selectedType()).toBeNull();
      expect(component.isEditMode()).toBe(false);
      expect(component.isSubmitting()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should load trip ID from route params', () => {
      fixture.detectChanges();
      expect(component.tripId()).toBe('trip-123');
    });

    it('should set error if no trip ID provided', () => {
      paramMapSubject.next(new Map<string, string | null>());
      fixture.detectChanges();
      expect(component.error()).toBe('No trip ID provided');
    });

    it('should set edit mode if item ID is present', () => {
      paramMapSubject.next(
        new Map<string, string | null>([
          ['tripId', 'trip-123'],
          ['itemId', 'item-456'],
        ]),
      );
      fixture.detectChanges();
      expect(component.itemId()).toBe('item-456');
      expect(component.isEditMode()).toBe(true);
    });

    it('should pre-select type from query params', () => {
      queryParamMapSubject.next(new Map<string, string | null>([['type', 'flight']]));
      fixture.detectChanges();
      expect(component.selectedType()).toBe('flight');
    });

    it('should ignore invalid type in query params', () => {
      queryParamMapSubject.next(new Map<string, string | null>([['type', 'invalid']]));
      fixture.detectChanges();
      expect(component.selectedType()).toBeNull();
    });
  });

  describe('Computed Properties', () => {
    it('hasSelectedType should return false when no type selected', () => {
      expect(component.hasSelectedType()).toBe(false);
    });

    it('hasSelectedType should return true when type selected', () => {
      component.selectedType.set('flight');
      expect(component.hasSelectedType()).toBe(true);
    });

    it('pageTitle should return "Add Item to Itinerary" when not in edit mode', () => {
      expect(component.pageTitle()).toBe('Add Item to Itinerary');
    });

    it('pageTitle should return "Edit Itinerary Item" when in edit mode', () => {
      component.isEditMode.set(true);
      expect(component.pageTitle()).toBe('Edit Itinerary Item');
    });
  });

  describe('Type Selection', () => {
    it('should have three item type options', () => {
      expect(component.itemTypes.length).toBe(3);
    });

    it('should include flight, transport, and accommodation types', () => {
      const types = component.itemTypes.map((t) => t.value);
      expect(types).toContain('flight');
      expect(types).toContain('transport');
      expect(types).toContain('accommodation');
    });

    it('should set selected type when selectType is called', () => {
      component.selectType('flight');
      expect(component.selectedType()).toBe('flight');
    });

    it('should clear error when selectType is called', () => {
      component.error.set('Test error');
      component.selectType('transport');
      expect(component.error()).toBeNull();
    });

    it('should reset type selection with backToSelector', () => {
      component.selectedType.set('accommodation');
      component.error.set('Test error');
      component.backToSelector();
      expect(component.selectedType()).toBeNull();
      expect(component.error()).toBeNull();
    });
  });

  describe('Flight Form Submission', () => {
    const mockFlight: Partial<Flight> = {
      title: 'Test Flight',
      startDate: new Date('2024-12-01T10:00:00'),
      endDate: new Date('2024-12-01T14:00:00'),
      flightNumber: 'AA123',
      airline: 'American Airlines',
      departureLocation: {
        address: 'LAX',
        city: 'Los Angeles',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
      },
      arrivalLocation: {
        address: 'JFK',
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.006,
      },
    };

    beforeEach(() => {
      component.tripId.set('trip-123');
    });

    it('should call store createFlight with trip ID and flight data', () => {
      component.onFlightSubmit(mockFlight);
      expect(mockItineraryStore.createFlight).toHaveBeenCalledWith({
        tripId: 'trip-123',
        flight: mockFlight,
      });
    });

    it('should set submitting state during submission', () => {
      component.onFlightSubmit(mockFlight);
      expect(component.isSubmitting()).toBe(true);
    });

    it('should clear error before submission', () => {
      component.error.set('Previous error');
      component.onFlightSubmit(mockFlight);
      expect(component.error()).toBeNull();
    });

    it('should set error if no trip ID available', () => {
      component.tripId.set(null);
      component.onFlightSubmit(mockFlight);
      expect(component.error()).toBe('No trip ID available');
      expect(mockItineraryStore.createFlight).not.toHaveBeenCalled();
    });

    it('should navigate back on successful submission', fakeAsync(() => {
      component.onFlightSubmit(mockFlight);
      tick(100);
      mockItineraryStore.loading.set(false);
      tick(100);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'trip-123']);
    }));

    it('should display error on failed submission', fakeAsync(() => {
      mockItineraryStore.loading.set(true);
      component.onFlightSubmit(mockFlight);
      expect(component.isSubmitting()).toBe(true);

      // Simulate store error
      mockItineraryStore.error.set('Failed to create flight');
      mockItineraryStore.loading.set(false);
      
      // Wait for interval to detect completion
      tick(150);
      
      expect(component.isSubmitting()).toBe(false);
      expect(component.error()).toBe('Failed to create flight');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should timeout after 10 seconds', fakeAsync(() => {
      mockItineraryStore.loading.set(true);
      component.onFlightSubmit(mockFlight);
      expect(component.isSubmitting()).toBe(true);
      
      // Simulate timeout - store never completes
      tick(10100);
      
      expect(component.isSubmitting()).toBe(false);
      expect(component.error()).toBe('Request timed out. Please try again.');
    }));
  });

  describe('Transport Form Submission', () => {
    const mockTransport: Partial<Transport> = {
      title: 'Test Train',
      startDate: new Date('2024-12-02T08:00:00'),
      endDate: new Date('2024-12-02T10:00:00'),
      transportType: 'train',
      provider: 'Eurostar',
      departureLocation: {
        address: 'Station A',
        city: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
      },
      arrivalLocation: {
        address: 'Station B',
        city: 'Brussels',
        country: 'Belgium',
        latitude: 50.8503,
        longitude: 4.3517,
      },
    };

    beforeEach(() => {
      component.tripId.set('trip-123');
    });

    it('should call store createTransport with trip ID and transport data', () => {
      component.onTransportSubmit(mockTransport);
      expect(mockItineraryStore.createTransport).toHaveBeenCalledWith({
        tripId: 'trip-123',
        transport: mockTransport,
      });
    });

    it('should set submitting state during submission', () => {
      component.onTransportSubmit(mockTransport);
      expect(component.isSubmitting()).toBe(true);
    });

    it('should set error if no trip ID available', () => {
      component.tripId.set(null);
      component.onTransportSubmit(mockTransport);
      expect(component.error()).toBe('No trip ID available');
      expect(mockItineraryStore.createTransport).not.toHaveBeenCalled();
    });

    it('should navigate back on successful submission', fakeAsync(() => {
      component.onTransportSubmit(mockTransport);
      tick(100);
      mockItineraryStore.loading.set(false);
      tick(100);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'trip-123']);
    }));

    it('should display error on failed submission', fakeAsync(() => {
      mockItineraryStore.loading.set(true);
      component.onTransportSubmit(mockTransport);
      expect(component.isSubmitting()).toBe(true);

      // Simulate store error
      mockItineraryStore.error.set('Failed to create transport');
      mockItineraryStore.loading.set(false);
      
      // Wait for interval to detect completion
      tick(150);
      
      expect(component.isSubmitting()).toBe(false);
      expect(component.error()).toBe('Failed to create transport');
    }));
  });

  describe('Accommodation Form Submission', () => {
    const mockAccommodation: Partial<Accommodation> = {
      title: 'Test Hotel',
      startDate: new Date('2024-12-03T15:00:00'),
      endDate: new Date('2024-12-05T11:00:00'),
      name: 'Hotel California',
      location: {
        address: '123 Main St',
        city: 'Los Angeles',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
      },
    };

    beforeEach(() => {
      component.tripId.set('trip-123');
    });

    it('should call store createAccommodation with trip ID and accommodation data', () => {
      component.onAccommodationSubmit(mockAccommodation);
      expect(mockItineraryStore.createAccommodation).toHaveBeenCalledWith({
        tripId: 'trip-123',
        accommodation: mockAccommodation,
      });
    });

    it('should set submitting state during submission', () => {
      component.onAccommodationSubmit(mockAccommodation);
      expect(component.isSubmitting()).toBe(true);
    });

    it('should set error if no trip ID available', () => {
      component.tripId.set(null);
      component.onAccommodationSubmit(mockAccommodation);
      expect(component.error()).toBe('No trip ID available');
      expect(mockItineraryStore.createAccommodation).not.toHaveBeenCalled();
    });

    it('should navigate back on successful submission', fakeAsync(() => {
      component.onAccommodationSubmit(mockAccommodation);
      tick(100);
      mockItineraryStore.loading.set(false);
      tick(100);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'trip-123']);
    }));

    it('should display error on failed submission', fakeAsync(() => {
      mockItineraryStore.loading.set(true);
      component.onAccommodationSubmit(mockAccommodation);
      expect(component.isSubmitting()).toBe(true);

      // Simulate store error
      mockItineraryStore.error.set('Failed to create accommodation');
      mockItineraryStore.loading.set(false);
      
      // Wait for interval to detect completion
      tick(150);
      
      expect(component.isSubmitting()).toBe(false);
      expect(component.error()).toBe('Failed to create accommodation');
    }));
  });

  describe('Navigation', () => {
    beforeEach(() => {
      component.tripId.set('trip-123');
    });

    it('should navigate back to trip detail on cancel', () => {
      component.cancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'trip-123']);
    });

    it('should navigate to trips list if no trip ID on cancel', () => {
      component.tripId.set(null);
      component.cancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips']);
    });

    it('should navigate back on form cancel', () => {
      component.onFormCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'trip-123']);
    });
  });

  describe('Display Helpers', () => {
    it('should return selected type label', () => {
      component.selectedType.set('flight');
      expect(component.getSelectedTypeLabel()).toBe('Flight');
    });

    it('should return empty string for null type', () => {
      component.selectedType.set(null);
      expect(component.getSelectedTypeLabel()).toBe('');
    });

    it('should return "Add" action label when not in edit mode', () => {
      component.isEditMode.set(false);
      expect(component.getActionLabel()).toBe('Add');
    });

    it('should return "Edit" action label when in edit mode', () => {
      component.isEditMode.set(true);
      expect(component.getActionLabel()).toBe('Edit');
    });
  });

  describe('Integration', () => {
    it('should handle complete add flight workflow', fakeAsync(() => {
      fixture.detectChanges();
      expect(component.tripId()).toBe('trip-123');

      component.selectType('flight');
      expect(component.selectedType()).toBe('flight');

      const flight: Partial<Flight> = {
        title: 'Test Flight',
        startDate: new Date(),
        endDate: new Date(),
        flightNumber: 'AA123',
        airline: 'American',
        departureLocation: {
          address: 'LAX',
          city: 'LA',
          country: 'USA',
          latitude: 34,
          longitude: -118,
        },
        arrivalLocation: {
          address: 'JFK',
          city: 'NY',
          country: 'USA',
          latitude: 40,
          longitude: -74,
        },
      };

      component.onFlightSubmit(flight);
      expect(component.isSubmitting()).toBe(true);
      expect(mockItineraryStore.createFlight).toHaveBeenCalled();

      tick(100);
      mockItineraryStore.loading.set(false);
      tick(100);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'trip-123']);
    }));

    it('should handle type selection and back navigation', () => {
      component.selectType('transport');
      expect(component.selectedType()).toBe('transport');
      expect(component.hasSelectedType()).toBe(true);

      component.backToSelector();
      expect(component.selectedType()).toBeNull();
      expect(component.hasSelectedType()).toBe(false);
    });
  });
});
