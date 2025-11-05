import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { TripsDashboardComponent } from './trips-dashboard.component';
import { TripsStore } from '../../store/trips.store';
import { Trip } from '../../../../core/models/trip.model';
import { TripListComponent } from '../../components/trip-list/trip-list.component';
import { TripFormComponent } from '../../components/trip-form/trip-form.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

describe('TripsDashboardComponent', () => {
  let component: TripsDashboardComponent;
  let fixture: ComponentFixture<TripsDashboardComponent>;
  let mockTripsStore: jasmine.SpyObj<typeof TripsStore.prototype>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockTrips: Trip[] = [
    new Trip({
      id: 'trip-1',
      title: 'Summer Vacation',
      description: 'Beach trip',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    new Trip({
      id: 'trip-2',
      title: 'Winter Holiday',
      description: 'Mountain trip',
      startDate: new Date('2024-12-20'),
      endDate: new Date('2024-12-27'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ];

  beforeEach(async () => {
    mockTripsStore = jasmine.createSpyObj('TripsStore', ['loadTrips', 'createTrip'], {
      trips: signal(mockTrips),
      loading: signal(false),
      error: signal(null),
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        TripsDashboardComponent,
        TripListComponent,
        TripFormComponent,
        LoadingSpinnerComponent,
      ],
      providers: [
        { provide: TripsStore, useValue: mockTripsStore },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load trips on init', () => {
      expect(mockTripsStore.loadTrips).toHaveBeenCalled();
    });

    it('should not show create form initially', () => {
      expect(component.showCreateForm).toBe(false);
    });
  });

  describe('Create Trip Flow', () => {
    it('should show create form when onCreateTrip is called', () => {
      expect(component.showCreateForm).toBe(false);

      component.onCreateTrip();

      expect(component.showCreateForm).toBe(true);
    });

    it('should call store createTrip when form is saved', () => {
      const newTripData: Partial<Trip> = {
        title: 'New Trip',
        description: 'Test trip',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-10'),
      };

      component.showCreateForm = true;
      component.onSaveTrip(newTripData);

      expect(mockTripsStore.createTrip).toHaveBeenCalledWith(newTripData);
      expect(component.showCreateForm).toBe(false);
    });

    it('should hide form when create is cancelled', () => {
      component.showCreateForm = true;

      component.onCancelCreate();

      expect(component.showCreateForm).toBe(false);
    });
  });

  describe('Loading States', () => {
    it('should return loading state from store', () => {
      expect(component.loading).toBe(false);
    });

    it('should return error state from store', () => {
      expect(component.error).toBeNull();
    });

    it('should show loading spinner when loading', async () => {
      // Recreate with loading state
      const loadingStore = jasmine.createSpyObj('TripsStore', ['loadTrips', 'createTrip'], {
        trips: signal([]),
        loading: signal(true),
        error: signal(null),
      });

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [
          TripsDashboardComponent,
          TripListComponent,
          TripFormComponent,
          LoadingSpinnerComponent,
        ],
        providers: [
          { provide: TripsStore, useValue: loadingStore },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      const loadingFixture = TestBed.createComponent(TripsDashboardComponent);
      loadingFixture.detectChanges();

      const compiled = loadingFixture.nativeElement as HTMLElement;
      const loadingElement = compiled.querySelector('app-loading-spinner');

      expect(loadingElement).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should call loadTrips when retry is clicked', () => {
      mockTripsStore.loadTrips.calls.reset();

      component.onRetry();

      expect(mockTripsStore.loadTrips).toHaveBeenCalled();
    });

    it('should show error message when error exists', async () => {
      // Recreate with error state
      const errorStore = jasmine.createSpyObj('TripsStore', ['loadTrips', 'createTrip'], {
        trips: signal([]),
        loading: signal(false),
        error: signal('Failed to load trips'),
      });

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [
          TripsDashboardComponent,
          TripListComponent,
          TripFormComponent,
          LoadingSpinnerComponent,
        ],
        providers: [
          { provide: TripsStore, useValue: errorStore },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      const errorFixture = TestBed.createComponent(TripsDashboardComponent);
      errorFixture.detectChanges();

      const errorComponent = errorFixture.componentInstance;
      expect(errorComponent.error).toBe('Failed to load trips');
    });
  });

  describe('Trips Display', () => {
    it('should show hasTrips as true when trips exist', () => {
      expect(component.hasTrips).toBe(true);
    });

    it('should show hasTrips as false when no trips exist', async () => {
      // Recreate with empty trips
      const emptyStore = jasmine.createSpyObj('TripsStore', ['loadTrips', 'createTrip'], {
        trips: signal([]),
        loading: signal(false),
        error: signal(null),
      });

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [
          TripsDashboardComponent,
          TripListComponent,
          TripFormComponent,
          LoadingSpinnerComponent,
        ],
        providers: [
          { provide: TripsStore, useValue: emptyStore },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      const emptyFixture = TestBed.createComponent(TripsDashboardComponent);
      emptyFixture.detectChanges();

      const emptyComponent = emptyFixture.componentInstance;
      expect(emptyComponent.hasTrips).toBe(false);
    });
  });

  describe('Component Integration', () => {
    it('should pass trips store to child components', () => {
      expect(component.tripsStore).toBeDefined();
      expect(component.tripsStore.trips()).toEqual(mockTrips);
    });

    it('should have access to trips store for rendering', () => {
      // Verify component has access to the store for child components
      expect(component.tripsStore).toBeDefined();
      expect(component.tripsStore.trips().length).toBe(2);
    });
  });

  describe('Lifecycle', () => {
    it('should load trips on first init', () => {
      // The beforeEach already calls ngOnInit which loads trips
      // So we expect it to have been called at least once
      expect(mockTripsStore.loadTrips).toHaveBeenCalled();
    });

    it('should not reload trips when ngOnInit called again after first load', () => {
      // First init already happened in beforeEach
      mockTripsStore.loadTrips.calls.reset();

      // Call ngOnInit again
      component.ngOnInit();

      // Should not call loadTrips again because hasLoadedTrips is true
      expect(mockTripsStore.loadTrips).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle creating trip with minimal data', () => {
      const minimalTrip: Partial<Trip> = {
        title: 'Quick Trip',
        startDate: new Date(),
        endDate: new Date(),
      };

      component.onSaveTrip(minimalTrip);

      expect(mockTripsStore.createTrip).toHaveBeenCalledWith(minimalTrip);
    });

    it('should handle toggling create form multiple times', () => {
      expect(component.showCreateForm).toBe(false);

      component.onCreateTrip();
      expect(component.showCreateForm).toBe(true);

      component.onCancelCreate();
      expect(component.showCreateForm).toBe(false);

      component.onCreateTrip();
      expect(component.showCreateForm).toBe(true);

      component.onCancelCreate();
      expect(component.showCreateForm).toBe(false);
    });
  });
});
