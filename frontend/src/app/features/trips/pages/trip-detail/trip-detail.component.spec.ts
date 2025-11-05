import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, ParamMap } from '@angular/router';
import { signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TripDetailComponent } from './trip-detail.component';
import { TripsStore } from '../../store/trips.store';
import { ItineraryStore } from '../../../itinerary/store/itinerary.store';
import { TripsApiService } from '../../services/trips-api.service';
import { Trip } from '../../../../core/models/trip.model';
import { Flight } from '../../../../core/models/flight.model';
import { Transport } from '../../../../core/models/transport.model';
import { Accommodation } from '../../../../core/models/accommodation.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { TripMapViewComponent } from '../../../maps/components/trip-map-view/trip-map-view.component';

describe('TripDetailComponent', () => {
  let component: TripDetailComponent;
  let fixture: ComponentFixture<TripDetailComponent>;
  let mockTripsStore: jasmine.SpyObj<typeof TripsStore.prototype>;
  let mockItineraryStore: jasmine.SpyObj<typeof ItineraryStore.prototype>;
  let mockTripsApiService: jasmine.SpyObj<TripsApiService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: {
    paramMap: Observable<ParamMap>;
  };

  const mockTrip: Trip = new Trip({
    id: 'trip-1',
    title: 'Summer Vacation',
    description: 'Beach trip',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockFlight: Flight = new Flight({
    id: 'flight-1',
    tripId: 'trip-1',
    type: 'flight',
    startDate: new Date('2024-07-01T10:00:00'),
    endDate: new Date('2024-07-01T12:00:00'),
    departureLocation: {
      address: 'JFK Airport',
      city: 'New York',
      country: 'USA',
      latitude: 40.6413,
      longitude: -73.7781,
    },
    arrivalLocation: {
      address: 'LAX Airport',
      city: 'Los Angeles',
      country: 'USA',
      latitude: 33.9416,
      longitude: -118.4085,
    },
    flightNumber: 'AA123',
    airline: 'American Airlines',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockTransport: Transport = new Transport({
    id: 'transport-1',
    tripId: 'trip-1',
    type: 'transport',
    startDate: new Date('2024-07-02T10:00:00'),
    endDate: new Date('2024-07-02T12:00:00'),
    departureLocation: {
      address: 'Hotel',
      city: 'Los Angeles',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437,
    },
    arrivalLocation: {
      address: 'Beach',
      city: 'Los Angeles',
      country: 'USA',
      latitude: 33.9975,
      longitude: -118.4682,
    },
    transportType: 'car',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockAccommodation: Accommodation = new Accommodation({
    id: 'accommodation-1',
    tripId: 'trip-1',
    type: 'accommodation',
    startDate: new Date('2024-07-01T15:00:00'),
    endDate: new Date('2024-07-05T11:00:00'),
    location: {
      address: 'Beach Hotel',
      city: 'Los Angeles',
      country: 'USA',
      latitude: 33.9975,
      longitude: -118.4682,
    },
    name: 'Beach Resort',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    mockTripsStore = jasmine.createSpyObj('TripsStore', ['loadTrips', 'selectTrip'], {
      trips: signal([mockTrip]),
      selectedTrip: signal(mockTrip),
      loading: signal(false),
      error: signal(null),
    });

    mockItineraryStore = jasmine.createSpyObj('ItineraryStore', ['loadItems', 'loadGaps'], {
      sortedItems: signal([mockFlight, mockTransport, mockAccommodation]),
      gaps: signal([]),
      loading: signal(false),
      error: signal(null),
    });

    mockTripsApiService = jasmine.createSpyObj('TripsApiService', [
      'exportTripToJson',
      'exportTripToICalendar',
    ]);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      paramMap: of(convertToParamMap({ id: 'trip-1' })),
    };

    await TestBed.configureTestingModule({
      imports: [TripDetailComponent, LoadingSpinnerComponent, TripMapViewComponent],
      providers: [
        { provide: TripsStore, useValue: mockTripsStore },
        { provide: ItineraryStore, useValue: mockItineraryStore },
        { provide: TripsApiService, useValue: mockTripsApiService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should extract trip ID from route params', () => {
      expect(component.tripId).toBe('trip-1');
    });

    it('should select trip in store on init', () => {
      expect(mockTripsStore.selectTrip).toHaveBeenCalledWith('trip-1');
    });

    it('should load itinerary items on init', () => {
      expect(mockItineraryStore.loadItems).toHaveBeenCalledWith('trip-1');
    });

    it('should load gaps on init', () => {
      expect(mockItineraryStore.loadGaps).toHaveBeenCalledWith('trip-1');
    });

    it('should default to timeline view mode', () => {
      expect(component.viewMode).toBe('timeline');
      expect(component.isTimelineView).toBe(true);
      expect(component.isMapView).toBe(false);
    });
  });

  describe('Route Parameter Handling', () => {
    it('should navigate to trips dashboard when no ID provided', async () => {
      mockActivatedRoute.paramMap = of(convertToParamMap({}));

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TripDetailComponent, LoadingSpinnerComponent, TripMapViewComponent],
        providers: [
          { provide: TripsStore, useValue: mockTripsStore },
          { provide: ItineraryStore, useValue: mockItineraryStore },
          { provide: TripsApiService, useValue: mockTripsApiService },
          { provide: Router, useValue: mockRouter },
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
        ],
      }).compileComponents();

      const noIdFixture = TestBed.createComponent(TripDetailComponent);
      noIdFixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips']);
    });
  });

  describe('Trip Display', () => {
    it('should return trip from store', () => {
      expect(component.trip).toEqual(mockTrip);
    });

    it('should return loading state combining both stores', () => {
      expect(component.loading).toBe(false);
    });

    it('should return error from trips or itinerary store', () => {
      expect(component.error).toBeNull();
    });

    it('should return itinerary items', () => {
      expect(component.itineraryItems).toEqual([mockFlight, mockTransport, mockAccommodation]);
    });

    it('should return gaps', () => {
      expect(component.gaps).toEqual([]);
    });

    it('should indicate if trip has items', () => {
      expect(component.hasItems).toBe(true);
    });

    it('should indicate trip not found when not loading and no trip exists', () => {
      Object.defineProperty(mockTripsStore, 'selectedTrip', {
        value: signal(null),
        writable: true,
      });
      Object.defineProperty(mockTripsStore, 'loading', {
        value: signal(false),
        writable: true,
      });

      expect(component.tripNotFound).toBe(true);
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to edit trip page', () => {
      component.onEditTrip();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'trip-1', 'edit']);
    });

    it('should navigate to add item page', () => {
      component.onAddItem();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'trip-1', 'add-item']);
    });

    it('should navigate to edit item page', () => {
      component.onEditItem('item-123');

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/trips',
        'trip-1',
        'edit-item',
        'item-123',
      ]);
    });

    it('should navigate back to trips dashboard', () => {
      component.onBackToTrips();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips']);
    });

    it('should not navigate when tripId is null', () => {
      component.tripId = null;
      mockRouter.navigate.calls.reset();

      component.onEditTrip();
      component.onAddItem();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('View Mode Toggle', () => {
    it('should toggle from timeline to map view', () => {
      expect(component.viewMode).toBe('timeline');

      component.toggleView();

      expect(component.viewMode).toBe('map');
      expect(component.isMapView).toBe(true);
      expect(component.isTimelineView).toBe(false);
    });

    it('should toggle from map to timeline view', () => {
      component.viewMode = 'map';

      component.toggleView();

      expect(component.viewMode).toBe('timeline');
      expect(component.isTimelineView).toBe(true);
      expect(component.isMapView).toBe(false);
    });
  });

  describe('Type Guards', () => {
    it('should identify Flight type correctly', () => {
      expect(component.isFlight(mockFlight)).toBe(true);
      expect(component.isFlight(mockTransport)).toBe(false);
      expect(component.isFlight(mockAccommodation)).toBe(false);
    });

    it('should identify Transport type correctly', () => {
      expect(component.isTransport(mockTransport)).toBe(true);
      expect(component.isTransport(mockFlight)).toBe(false);
      expect(component.isTransport(mockAccommodation)).toBe(false);
    });

    it('should identify Accommodation type correctly', () => {
      expect(component.isAccommodation(mockAccommodation)).toBe(true);
      expect(component.isAccommodation(mockFlight)).toBe(false);
      expect(component.isAccommodation(mockTransport)).toBe(false);
    });

    it('should convert items to specific types', () => {
      const flight = component.asFlight(mockFlight);
      const transport = component.asTransport(mockTransport);
      const accommodation = component.asAccommodation(mockAccommodation);

      expect(flight.flightNumber).toBe('AA123');
      expect(transport.transportType).toBe('car');
      expect(accommodation.name).toBe('Beach Resort');
    });
  });

  describe('Error Handling and Retry', () => {
    it('should reload data when retry is called', () => {
      mockTripsStore.selectTrip.calls.reset();
      mockItineraryStore.loadItems.calls.reset();
      mockItineraryStore.loadGaps.calls.reset();

      component.onRetry();

      expect(mockTripsStore.selectTrip).toHaveBeenCalledWith('trip-1');
      expect(mockItineraryStore.loadItems).toHaveBeenCalledWith('trip-1');
      expect(mockItineraryStore.loadGaps).toHaveBeenCalledWith('trip-1');
    });

    it('should not retry when tripId is null', () => {
      component.tripId = null;
      mockTripsStore.selectTrip.calls.reset();

      component.onRetry();

      expect(mockTripsStore.selectTrip).not.toHaveBeenCalled();
    });
  });

  describe('Export Functionality', () => {
    it('should call export service for JSON export when tripId exists', () => {
      // Use unknown for export data since we're only testing the service call
      mockTripsApiService.exportTripToJson.and.returnValue(of({} as unknown as any));

      component.onExportToJson();

      expect(mockTripsApiService.exportTripToJson).toHaveBeenCalledWith('trip-1');
    });

    it('should call export service for iCalendar export when tripId exists', () => {
      const mockBlob = new Blob(['ical data'], { type: 'text/calendar' });
      mockTripsApiService.exportTripToICalendar.and.returnValue(of(mockBlob));

      component.onExportToICalendar();

      expect(mockTripsApiService.exportTripToICalendar).toHaveBeenCalledWith('trip-1');
    });

    it('should call export service for iCalendar export when tripId exists', () => {
      const mockBlob = new Blob(['ical data'], { type: 'text/calendar' });
      mockTripsApiService.exportTripToICalendar.and.returnValue(of(mockBlob));

      component.onExportToICalendar();

      expect(mockTripsApiService.exportTripToICalendar).toHaveBeenCalledWith('trip-1');
    });

    it('should not export when tripId is null', () => {
      component.tripId = null;

      component.onExportToJson();
      component.onExportToICalendar();

      expect(mockTripsApiService.exportTripToJson).not.toHaveBeenCalled();
      expect(mockTripsApiService.exportTripToICalendar).not.toHaveBeenCalled();
    });

    it('should not export when trip is null', () => {
      Object.defineProperty(mockTripsStore, 'selectedTrip', {
        value: signal(null),
        writable: true,
      });

      component.onExportToJson();
      component.onExportToICalendar();

      expect(mockTripsApiService.exportTripToJson).not.toHaveBeenCalled();
      expect(mockTripsApiService.exportTripToICalendar).not.toHaveBeenCalled();
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      const testDate = new Date('2024-07-01T10:00:00');
      const formatted = component.formatDate(testDate);

      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty itinerary items', async () => {
      const emptyItineraryStore = jasmine.createSpyObj(
        'ItineraryStore',
        ['loadItems', 'loadGaps'],
        {
          sortedItems: signal([]),
          gaps: signal([]),
          loading: signal(false),
          error: signal(null),
        },
      );

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TripDetailComponent, LoadingSpinnerComponent, TripMapViewComponent],
        providers: [
          { provide: TripsStore, useValue: mockTripsStore },
          { provide: ItineraryStore, useValue: emptyItineraryStore },
          { provide: TripsApiService, useValue: mockTripsApiService },
          { provide: Router, useValue: mockRouter },
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
        ],
      }).compileComponents();

      const emptyFixture = TestBed.createComponent(TripDetailComponent);
      emptyFixture.detectChanges();
      const emptyComponent = emptyFixture.componentInstance;

      expect(emptyComponent.hasItems).toBe(false);
      expect(emptyComponent.itineraryItems.length).toBe(0);
    });

    it('should handle loading state from trips store', () => {
      Object.defineProperty(mockTripsStore, 'loading', {
        value: signal(true),
        writable: true,
      });

      expect(component.loading).toBe(true);
    });

    it('should handle loading state from itinerary store', () => {
      Object.defineProperty(mockItineraryStore, 'loading', {
        value: signal(true),
        writable: true,
      });

      expect(component.loading).toBe(true);
    });

    it('should handle error from trips store', () => {
      Object.defineProperty(mockTripsStore, 'error', {
        value: signal('Trips error'),
        writable: true,
      });

      expect(component.error).toBe('Trips error');
    });

    it('should handle error from itinerary store', () => {
      Object.defineProperty(mockItineraryStore, 'error', {
        value: signal('Itinerary error'),
        writable: true,
      });

      expect(component.error).toBe('Itinerary error');
    });
  });
});
