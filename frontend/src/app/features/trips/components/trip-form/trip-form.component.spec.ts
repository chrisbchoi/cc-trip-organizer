import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TripFormComponent } from './trip-form.component';
import { Trip } from '../../../../core/models/trip.model';
import { AutoSaveService, AutoSaveStatus } from '../../../../core/services/auto-save.service';
import { of } from 'rxjs';

describe('TripFormComponent', () => {
  let component: TripFormComponent;
  let fixture: ComponentFixture<TripFormComponent>;
  let mockAutoSaveService: jasmine.SpyObj<AutoSaveService>;

  beforeEach(async () => {
    mockAutoSaveService = jasmine.createSpyObj(
      'AutoSaveService',
      ['setupAutoSave', 'reset', 'configure'],
      {
        status$: of(AutoSaveStatus.IDLE),
      },
    );
    mockAutoSaveService.setupAutoSave.and.returnValue(
      of({ status: 'idle', timestamp: Date.now() }),
    );

    await TestBed.configureTestingModule({
      imports: [TripFormComponent, ReactiveFormsModule],
      providers: [{ provide: AutoSaveService, useValue: mockAutoSaveService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TripFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values when no trip provided', () => {
      expect(component.tripForm).toBeDefined();
      expect(component.tripForm.get('title')?.value).toBe('');
      expect(component.tripForm.get('description')?.value).toBe('');
      expect(component.tripForm.get('startDate')?.value).toBe('');
      expect(component.tripForm.get('endDate')?.value).toBe('');
    });

    it('should initialize form with trip values when trip is provided', () => {
      const mockTrip = new Trip({
        id: 'test-123',
        title: 'Summer Vacation',
        description: 'Beach trip',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      component.trip = mockTrip;
      component.ngOnInit();

      expect(component.tripForm.get('title')?.value).toBe('Summer Vacation');
      expect(component.tripForm.get('description')?.value).toBe('Beach trip');
    });
  });

  describe('Form Validation', () => {
    it('should mark title as required', () => {
      const titleControl = component.tripForm.get('title');

      titleControl?.setValue('');
      expect(titleControl?.hasError('required')).toBe(true);

      titleControl?.setValue('My Trip');
      expect(titleControl?.hasError('required')).toBe(false);
    });

    it('should validate that end date is after start date', () => {
      component.tripForm.patchValue({
        startDate: '2024-07-15',
        endDate: '2024-07-10', // Before start date
      });

      expect(component.tripForm.hasError('dateRange')).toBe(true);
    });

    it('should pass validation when end date is after start date', () => {
      component.tripForm.patchValue({
        title: 'Valid Trip',
        startDate: '2024-07-01',
        endDate: '2024-07-15',
      });

      expect(component.tripForm.hasError('dateRange')).toBe(false);
      expect(component.tripForm.valid).toBe(true);
    });

    it('should validate that end date must be after start date', () => {
      component.tripForm.patchValue({
        title: 'One Day Trip',
        startDate: '2024-07-15',
        endDate: '2024-07-15', // Equal to start date - should fail
      });

      expect(component.tripForm.hasError('dateRange')).toBe(true);
    });

    it('should mark form as invalid when required fields are empty', () => {
      component.tripForm.patchValue({
        title: '',
        description: 'Some description',
        startDate: '',
        endDate: '',
      });

      expect(component.tripForm.invalid).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should emit save event with form data when form is valid', () => {
      spyOn(component.save, 'emit');

      component.tripForm.patchValue({
        title: 'Test Trip',
        description: 'Test Description',
        startDate: '2024-07-01',
        endDate: '2024-07-15',
      });

      component.onSubmit();

      expect(component.save.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Test Trip',
          description: 'Test Description',
        }),
      );
    });

    it('should not emit save event when form is invalid', () => {
      spyOn(component.save, 'emit');

      component.tripForm.patchValue({
        title: '', // Required field empty
        startDate: '2024-07-01',
        endDate: '2024-07-15',
      });

      component.onSubmit();

      expect(component.save.emit).not.toHaveBeenCalled();
    });

    it('should set submitted flag to true on submit attempt', () => {
      expect(component.submitted).toBe(false);

      component.onSubmit();

      expect(component.submitted).toBe(true);
    });

    it('should include trip ID when editing existing trip', () => {
      spyOn(component.save, 'emit');

      const existingTrip = new Trip({
        id: 'existing-123',
        title: 'Existing Trip',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      component.trip = existingTrip;
      component.ngOnInit();

      component.tripForm.patchValue({
        title: 'Updated Trip',
      });

      component.onSubmit();

      expect(component.save.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 'existing-123',
          title: 'Updated Trip',
        }),
      );
    });
  });

  describe('Auto-Save Functionality', () => {
    it('should setup auto-save when editing existing trip', fakeAsync(() => {
      const existingTrip = new Trip({
        id: 'existing-123',
        title: 'Existing Trip',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      component.trip = existingTrip;
      component.enableAutoSave = true;
      component.ngOnInit();

      tick(100);

      expect(mockAutoSaveService.setupAutoSave).toHaveBeenCalled();
    }));

    it('should not setup auto-save when creating new trip', () => {
      component.trip = undefined;
      component.ngOnInit();

      expect(mockAutoSaveService.setupAutoSave).not.toHaveBeenCalled();
    });

    it('should call reset on component destroy', () => {
      component.ngOnDestroy();

      expect(mockAutoSaveService.reset).toHaveBeenCalled();
    });

    it('should not setup auto-save when enableAutoSave is false', () => {
      const existingTrip = new Trip({
        id: 'existing-123',
        title: 'Existing Trip',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      component.trip = existingTrip;
      component.enableAutoSave = false;
      component.ngOnInit();

      expect(mockAutoSaveService.setupAutoSave).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('should emit cancelForm event when cancel is clicked', () => {
      spyOn(component.cancelForm, 'emit');

      component.onCancel();

      expect(component.cancelForm.emit).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title input', () => {
      const longTitle = 'A'.repeat(500);

      component.tripForm.patchValue({
        title: longTitle,
        startDate: '2024-07-01',
        endDate: '2024-07-15',
      });

      expect(component.tripForm.get('title')?.value).toBe(longTitle);
    });

    it('should handle very long description input', () => {
      const longDescription = 'B'.repeat(5000);

      component.tripForm.patchValue({
        title: 'Trip',
        description: longDescription,
      });

      expect(component.tripForm.get('description')?.value).toBe(longDescription);
    });

    it('should handle date inputs with different formats', () => {
      component.tripForm.patchValue({
        title: 'Trip',
        startDate: '2024-07-01',
        endDate: '2024-07-15',
      });

      expect(component.tripForm.valid).toBe(true);
    });
  });
});
