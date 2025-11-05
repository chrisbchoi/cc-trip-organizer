import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AccommodationFormComponent } from './accommodation-form.component';
import { Accommodation } from '../../../../core/models/accommodation.model';

describe('AccommodationFormComponent', () => {
  let component: AccommodationFormComponent;
  let fixture: ComponentFixture<AccommodationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccommodationFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AccommodationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form', () => {
      expect(component.accommodationForm).toBeDefined();
      expect(component.accommodationForm.get('title')?.value).toBe('');
      expect(component.accommodationForm.get('name')?.value).toBe('');
    });

    it('should have all required form controls', () => {
      const controls = [
        'title',
        'name',
        'confirmationNumber',
        'phoneNumber',
        'checkInDate',
        'checkInTime',
        'checkOutDate',
        'checkOutTime',
        'address',
        'latitude',
        'longitude',
        'city',
        'country',
        'notes',
      ];

      controls.forEach((control) => {
        expect(component.accommodationForm.get(control)).toBeDefined();
      });
    });

    it('should set required validators on mandatory fields', () => {
      const requiredFields = [
        'title',
        'name',
        'checkInDate',
        'checkInTime',
        'checkOutDate',
        'checkOutTime',
        'address',
      ];

      requiredFields.forEach((field) => {
        const control = component.accommodationForm.get(field);
        control?.setValue('');
        expect(control?.hasError('required')).toBe(true);
      });
    });

    it('should initialize signals as null', () => {
      expect(component.checkInDateTime()).toBeNull();
      expect(component.checkOutDateTime()).toBeNull();
    });
  });

  describe('Form Population (Edit Mode)', () => {
    const mockAccommodation = {
      id: '1',
      tripId: 'trip-1',
      type: 'accommodation',
      title: 'Hotel California',
      name: 'Hotel California',
      startDate: new Date('2024-12-01T15:00:00'),
      endDate: new Date('2024-12-03T11:00:00'),
      location: {
        address: '123 Main St',
        latitude: 34.05,
        longitude: -118.25,
        city: 'Los Angeles',
        country: 'USA',
      },
      confirmationNumber: 'CONF123',
      phoneNumber: '+1234567890',
      notes: 'Early check-in requested',
    } as unknown as Accommodation;

    beforeEach(() => {
      component.accommodation = mockAccommodation;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should populate form with accommodation data', () => {
      expect(component.accommodationForm.get('title')?.value).toBe('Hotel California');
      expect(component.accommodationForm.get('name')?.value).toBe('Hotel California');
      expect(component.accommodationForm.get('confirmationNumber')?.value).toBe('CONF123');
      expect(component.accommodationForm.get('phoneNumber')?.value).toBe('+1234567890');
      expect(component.accommodationForm.get('address')?.value).toBe('123 Main St');
      expect(component.accommodationForm.get('latitude')?.value).toBe(34.05);
      expect(component.accommodationForm.get('longitude')?.value).toBe(-118.25);
      expect(component.accommodationForm.get('city')?.value).toBe('Los Angeles');
      expect(component.accommodationForm.get('country')?.value).toBe('USA');
      expect(component.accommodationForm.get('notes')?.value).toBe('Early check-in requested');
    });

    it('should populate check-in date and time', () => {
      expect(component.accommodationForm.get('checkInDate')?.value).toBe('2024-12-01');
      expect(component.accommodationForm.get('checkInTime')?.value).toBe('15:00');
    });

    it('should populate check-out date and time', () => {
      expect(component.accommodationForm.get('checkOutDate')?.value).toBe('2024-12-03');
      expect(component.accommodationForm.get('checkOutTime')?.value).toBe('11:00');
    });

    it('should update signals with accommodation dates', () => {
      expect(component.checkInDateTime()).toEqual(mockAccommodation.startDate);
      expect(component.checkOutDateTime()).toEqual(mockAccommodation.endDate);
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate duration between check-in and check-out', () => {
      component.checkInDateTime.set(new Date('2024-12-01T15:00:00'));
      component.checkOutDateTime.set(new Date('2024-12-03T11:00:00'));

      // 2 days minus 4 hours = 44 hours = 2640 minutes
      expect(component.durationMinutes()).toBe(2640);
    });

    it('should return 0 duration when check-in is null', () => {
      component.checkInDateTime.set(null);
      component.checkOutDateTime.set(new Date('2024-12-03T11:00:00'));

      expect(component.durationMinutes()).toBe(0);
    });

    it('should return 0 duration when check-out is null', () => {
      component.checkInDateTime.set(new Date('2024-12-01T15:00:00'));
      component.checkOutDateTime.set(null);

      expect(component.durationMinutes()).toBe(0);
    });

    it('should return 0 duration when check-out is before check-in', () => {
      component.checkInDateTime.set(new Date('2024-12-03T11:00:00'));
      component.checkOutDateTime.set(new Date('2024-12-01T15:00:00'));

      expect(component.durationMinutes()).toBe(0);
    });

    it('should format duration with nights count', () => {
      component.checkInDateTime.set(new Date('2024-12-01T15:00:00'));
      component.checkOutDateTime.set(new Date('2024-12-03T11:00:00'));

      // 44 hours = 1 day 20 hours = 1 night (floor of 44/24 = 1)
      expect(component.formattedDuration()).toContain('1 night');
    });

    it('should format duration with 1 night for singular', () => {
      component.checkInDateTime.set(new Date('2024-12-01T15:00:00'));
      component.checkOutDateTime.set(new Date('2024-12-02T11:00:00'));

      // 20 hours = 0 nights (floor of 20/24 = 0)
      expect(component.formattedDuration()).toContain('0 nights');
    });

    it('should return empty string when duration is 0', () => {
      component.checkInDateTime.set(null);
      component.checkOutDateTime.set(null);

      expect(component.formattedDuration()).toBe('');
    });
  });

  describe('Signal Updates', () => {
    it('should update checkInDateTime signal when date and time are set', () => {
      component.accommodationForm.patchValue({
        checkInDate: '2024-12-01',
        checkInTime: '15:00',
      });

      component.updateCheckInSignal();

      const checkIn = component.checkInDateTime();
      expect(checkIn).toBeTruthy();
      expect(checkIn?.getFullYear()).toBe(2024);
      expect(checkIn?.getMonth()).toBe(11); // December (0-indexed)
      expect(checkIn?.getDate()).toBe(1);
      expect(checkIn?.getHours()).toBe(15);
      expect(checkIn?.getMinutes()).toBe(0);
    });

    it('should update checkOutDateTime signal when date and time are set', () => {
      component.accommodationForm.patchValue({
        checkOutDate: '2024-12-03',
        checkOutTime: '11:00',
      });

      component.updateCheckOutSignal();

      const checkOut = component.checkOutDateTime();
      expect(checkOut).toBeTruthy();
      expect(checkOut?.getFullYear()).toBe(2024);
      expect(checkOut?.getMonth()).toBe(11);
      expect(checkOut?.getDate()).toBe(3);
      expect(checkOut?.getHours()).toBe(11);
      expect(checkOut?.getMinutes()).toBe(0);
    });

    it('should not update signal if date is missing', () => {
      component.accommodationForm.patchValue({
        checkInDate: '',
        checkInTime: '15:00',
      });

      component.updateCheckInSignal();

      expect(component.checkInDateTime()).toBeNull();
    });

    it('should not update signal if time is missing', () => {
      component.accommodationForm.patchValue({
        checkInDate: '2024-12-01',
        checkInTime: '',
      });

      component.updateCheckInSignal();

      expect(component.checkInDateTime()).toBeNull();
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when required fields are empty', () => {
      expect(component.accommodationForm.valid).toBe(false);
    });

    it('should be valid when all required fields are filled', () => {
      component.accommodationForm.patchValue({
        title: 'Hotel Test',
        name: 'Test Hotel',
        checkInDate: '2024-12-01',
        checkInTime: '15:00',
        checkOutDate: '2024-12-03',
        checkOutTime: '11:00',
        address: '123 Test St',
        latitude: 34.05,
        longitude: -118.25,
      });

      expect(component.accommodationForm.valid).toBe(true);
    });

    it('should validate title minimum length', () => {
      const titleControl = component.accommodationForm.get('title');
      titleControl?.setValue('ab');

      expect(titleControl?.hasError('minlength')).toBe(true);
    });

    it('should validate name minimum length', () => {
      const nameControl = component.accommodationForm.get('name');
      nameControl?.setValue('a');

      expect(nameControl?.hasError('minlength')).toBe(true);
    });

    it('should validate latitude range', () => {
      const latControl = component.accommodationForm.get('latitude');

      latControl?.setValue(-91);
      expect(latControl?.hasError('min')).toBe(true);

      latControl?.setValue(91);
      expect(latControl?.hasError('max')).toBe(true);

      latControl?.setValue(45);
      expect(latControl?.valid).toBe(true);
    });

    it('should validate longitude range', () => {
      const lonControl = component.accommodationForm.get('longitude');

      lonControl?.setValue(-181);
      expect(lonControl?.hasError('min')).toBe(true);

      lonControl?.setValue(181);
      expect(lonControl?.hasError('max')).toBe(true);

      lonControl?.setValue(-120);
      expect(lonControl?.valid).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should detect field errors with hasError', () => {
      const titleControl = component.accommodationForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();

      expect(component.hasError('title', 'required')).toBe(true);
    });

    it('should not show error before field is touched', () => {
      const titleControl = component.accommodationForm.get('title');
      titleControl?.setValue('');

      expect(component.hasError('title', 'required')).toBe(false);
    });

    it('should return correct error messages', () => {
      const titleControl = component.accommodationForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();

      expect(component.getErrorMessage('title')).toContain('required');
    });

    it('should return minlength error message', () => {
      const titleControl = component.accommodationForm.get('title');
      titleControl?.setValue('ab');
      titleControl?.markAsTouched();

      expect(component.getErrorMessage('title')).toContain('at least 3 characters');
    });

    it('should return range error message for latitude', () => {
      const latControl = component.accommodationForm.get('latitude');
      latControl?.setValue(100);
      latControl?.markAsTouched();

      expect(component.getErrorMessage('latitude')).toContain('Invalid');
    });

    it('should detect date-time validation error', () => {
      component.checkInDateTime.set(new Date('2024-12-03T15:00:00'));
      component.checkOutDateTime.set(new Date('2024-12-01T11:00:00'));

      expect(component.hasDateTimeError()).toBe(true);
    });

    it('should not show date-time error when dates are valid', () => {
      component.checkInDateTime.set(new Date('2024-12-01T15:00:00'));
      component.checkOutDateTime.set(new Date('2024-12-03T11:00:00'));

      expect(component.hasDateTimeError()).toBe(false);
    });

    it('should not show date-time error when dates are null', () => {
      component.checkInDateTime.set(null);
      component.checkOutDateTime.set(null);

      expect(component.hasDateTimeError()).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should emit accommodation data on valid submit', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitAccommodation.subscribe(submitSpy);

      component.accommodationForm.patchValue({
        title: 'Hotel Test',
        name: 'Test Hotel',
        confirmationNumber: 'CONF123',
        phoneNumber: '+1234567890',
        checkInDate: '2024-12-01',
        checkInTime: '15:00',
        checkOutDate: '2024-12-03',
        checkOutTime: '11:00',
        address: '123 Test St',
        latitude: 34.05,
        longitude: -118.25,
        city: 'Los Angeles',
        country: 'USA',
        notes: 'Test notes',
      });

      component.updateCheckInSignal();
      component.updateCheckOutSignal();

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Hotel Test',
          name: 'Test Hotel',
          confirmationNumber: 'CONF123',
          phoneNumber: '+1234567890',
          location: jasmine.objectContaining({
            address: '123 Test St',
            latitude: 34.05,
            longitude: -118.25,
            city: 'Los Angeles',
            country: 'USA',
          }),
          notes: 'Test notes',
        }),
      );
    });

    it('should include accommodation ID when editing', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitAccommodation.subscribe(submitSpy);

      component.accommodation = { id: '123' } as Accommodation;

      component.accommodationForm.patchValue({
        title: 'Hotel Test',
        name: 'Test Hotel',
        checkInDate: '2024-12-01',
        checkInTime: '15:00',
        checkOutDate: '2024-12-03',
        checkOutTime: '11:00',
        address: '123 Test St',
        latitude: 34.05,
        longitude: -118.25,
      });

      component.updateCheckInSignal();
      component.updateCheckOutSignal();

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith(jasmine.objectContaining({ id: '123' }));
    });

    it('should not emit if form is invalid', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitAccommodation.subscribe(submitSpy);

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid submit', () => {
      component.onSubmit();

      expect(component.accommodationForm.get('title')?.touched).toBe(true);
      expect(component.accommodationForm.get('name')?.touched).toBe(true);
    });

    it('should not emit if check-out is before or equal to check-in', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitAccommodation.subscribe(submitSpy);

      component.accommodationForm.patchValue({
        title: 'Hotel Test',
        name: 'Test Hotel',
        checkInDate: '2024-12-03',
        checkInTime: '15:00',
        checkOutDate: '2024-12-01',
        checkOutTime: '11:00',
        address: '123 Test St',
        latitude: 34.05,
        longitude: -118.25,
      });

      component.updateCheckInSignal();
      component.updateCheckOutSignal();

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should omit optional fields when empty', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitAccommodation.subscribe(submitSpy);

      component.accommodationForm.patchValue({
        title: 'Hotel Test',
        name: 'Test Hotel',
        confirmationNumber: '',
        phoneNumber: '',
        checkInDate: '2024-12-01',
        checkInTime: '15:00',
        checkOutDate: '2024-12-03',
        checkOutTime: '11:00',
        address: '123 Test St',
        latitude: 34.05,
        longitude: -118.25,
        city: '',
        country: '',
        notes: '',
      });

      component.updateCheckInSignal();
      component.updateCheckOutSignal();

      component.onSubmit();

      const emittedData = submitSpy.calls.mostRecent().args[0];
      expect(emittedData.confirmationNumber).toBeUndefined();
      expect(emittedData.phoneNumber).toBeUndefined();
      expect(emittedData.notes).toBeUndefined();
      expect(emittedData.location.city).toBeUndefined();
      expect(emittedData.location.country).toBeUndefined();
    });
  });

  describe('Form Cancellation', () => {
    it('should emit cancel event', () => {
      const cancelSpy = jasmine.createSpy('cancelSpy');
      component.cancelForm.subscribe(cancelSpy);

      component.onCancel();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });
});
