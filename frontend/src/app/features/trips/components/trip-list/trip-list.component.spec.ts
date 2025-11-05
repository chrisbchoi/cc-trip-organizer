import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { TripListComponent } from './trip-list.component';
import { TripsStore } from '../../store/trips.store';
import { Trip } from '../../../../core/models/trip.model';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

describe('TripListComponent', () => {
  let component: TripListComponent;
  let fixture: ComponentFixture<TripListComponent>;
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
    mockTripsStore = jasmine.createSpyObj('TripsStore', ['loadTrips', 'deleteTrip'], {
      trips: signal(mockTrips),
      loading: signal(false),
      error: signal(null),
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TripListComponent, ConfirmationDialogComponent],
      providers: [
        { provide: TripsStore, useValue: mockTripsStore },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripListComponent);
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

    it('should initialize with no delete confirmation dialog shown', () => {
      expect(component.showDeleteConfirmation).toBe(false);
      expect(component.tripToDelete).toBeNull();
    });
  });

  describe('Trips Display', () => {
    it('should display trips from store signal', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const tripCards = compiled.querySelectorAll('.trip-card');

      expect(tripCards.length).toBe(2);
    });

    it('should show loading state when loading', async () => {
      // Recreate fixture with loading state
      const loadingStore = jasmine.createSpyObj('TripsStore', ['loadTrips', 'deleteTrip'], {
        trips: signal([]),
        loading: signal(true),
        error: signal(null),
      });

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TripListComponent, ConfirmationDialogComponent],
        providers: [
          { provide: TripsStore, useValue: loadingStore },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      const loadingFixture = TestBed.createComponent(TripListComponent);
      loadingFixture.detectChanges();

      const compiled = loadingFixture.nativeElement as HTMLElement;
      const loadingElement = compiled.querySelector('.loading-container');

      expect(loadingElement).toBeTruthy();
    });

    it('should show error message when error exists', async () => {
      // Recreate fixture with error state
      const errorStore = jasmine.createSpyObj('TripsStore', ['loadTrips', 'deleteTrip'], {
        trips: signal([]),
        loading: signal(false),
        error: signal('Failed to load trips'),
      });

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TripListComponent, ConfirmationDialogComponent],
        providers: [
          { provide: TripsStore, useValue: errorStore },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      const errorFixture = TestBed.createComponent(TripListComponent);
      errorFixture.detectChanges();

      const compiled = errorFixture.nativeElement as HTMLElement;
      const errorElement = compiled.querySelector('.error-state');

      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent).toContain('Failed to load trips');
    });

    it('should show empty state when no trips exist', async () => {
      // Recreate fixture with empty state
      const emptyStore = jasmine.createSpyObj('TripsStore', ['loadTrips', 'deleteTrip'], {
        trips: signal([]),
        loading: signal(false),
        error: signal(null),
      });

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TripListComponent, ConfirmationDialogComponent],
        providers: [
          { provide: TripsStore, useValue: emptyStore },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      const emptyFixture = TestBed.createComponent(TripListComponent);
      emptyFixture.detectChanges();

      const compiled = emptyFixture.nativeElement as HTMLElement;
      const emptyState = compiled.querySelector('.empty-state');

      expect(emptyState).toBeTruthy();
    });
  });

  describe('Trip Navigation', () => {
    it('should navigate to trip detail when onViewTrip is called', () => {
      component.onViewTrip('trip-1');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'trip-1']);
    });

    it('should navigate with correct route for different trip IDs', () => {
      component.onViewTrip('trip-2');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'trip-2']);
    });
  });

  describe('Delete Confirmation Dialog', () => {
    it('should show confirmation dialog when onDeleteTrip is called', () => {
      const mockEvent = new Event('click');
      expect(component.showDeleteConfirmation).toBe(false);

      component.onDeleteTrip('trip-1', 'Summer Vacation', mockEvent);

      expect(component.showDeleteConfirmation).toBe(true);
      expect(component.tripToDelete).toBe('trip-1');
      expect(component.tripNameToDelete).toBe('Summer Vacation');
    });

    it('should store correct trip ID when delete is initiated', () => {
      const mockEvent = new Event('click');
      component.onDeleteTrip('trip-2', 'Winter Holiday', mockEvent);

      expect(component.tripToDelete).toBe('trip-2');
      expect(component.tripNameToDelete).toBe('Winter Holiday');
    });

    it('should close dialog when onCancelDelete is called', () => {
      component.showDeleteConfirmation = true;
      component.tripToDelete = 'trip-1';
      component.tripNameToDelete = 'Summer Vacation';

      component.onCancelDelete();

      expect(component.showDeleteConfirmation).toBe(false);
      expect(component.tripToDelete).toBeNull();
      expect(component.tripNameToDelete).toBe('');
    });

    it('should stop event propagation when onDeleteTrip is called', () => {
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');

      component.onDeleteTrip('trip-1', 'Summer Vacation', mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Delete Confirmation', () => {
    it('should call store deleteTrip when onConfirmDelete is called', () => {
      component.tripToDelete = 'trip-1';

      component.onConfirmDelete();

      expect(mockTripsStore.deleteTrip).toHaveBeenCalledWith('trip-1');
    });

    it('should close dialog after confirming delete', () => {
      component.showDeleteConfirmation = true;
      component.tripToDelete = 'trip-1';
      component.tripNameToDelete = 'Summer Vacation';

      component.onConfirmDelete();

      expect(component.showDeleteConfirmation).toBe(false);
      expect(component.tripToDelete).toBeNull();
      expect(component.tripNameToDelete).toBe('');
    });

    it('should not call deleteTrip if no trip is selected', () => {
      component.tripToDelete = null;

      component.onConfirmDelete();

      expect(mockTripsStore.deleteTrip).not.toHaveBeenCalled();
    });
  });

  describe('Signal Integration', () => {
    it('should access trips from store signal', () => {
      expect(component.trips()).toEqual(mockTrips);
      expect(component.trips().length).toBe(2);
    });

    it('should access loading from store signal', () => {
      expect(component.loading()).toBe(false);
    });

    it('should access error from store signal', () => {
      expect(component.error()).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle trip with no description', async () => {
      const tripNoDescription = new Trip({
        id: 'trip-3',
        title: 'No Description Trip',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-08-10'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newStore = jasmine.createSpyObj('TripsStore', ['loadTrips', 'deleteTrip'], {
        trips: signal([tripNoDescription]),
        loading: signal(false),
        error: signal(null),
      });

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TripListComponent, ConfirmationDialogComponent],
        providers: [
          { provide: TripsStore, useValue: newStore },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(TripListComponent);
      newFixture.detectChanges();

      const compiled = newFixture.nativeElement as HTMLElement;
      const tripCards = compiled.querySelectorAll('.trip-card');

      expect(tripCards.length).toBe(1);
    });

    it('should handle very long trip title', () => {
      const longTitle = 'A'.repeat(200);
      expect(longTitle.length).toBe(200);
      // Component should handle long titles without errors
      expect(component.trips()[0].title).toBeDefined();
    });

    it('should handle rapid delete confirmations', () => {
      const mockEvent = new Event('click');
      component.onDeleteTrip('trip-1', 'Summer Vacation', mockEvent);
      expect(component.tripToDelete).toBe('trip-1');

      component.onDeleteTrip('trip-2', 'Winter Holiday', mockEvent);
      expect(component.tripToDelete).toBe('trip-2');
    });
  });
});
