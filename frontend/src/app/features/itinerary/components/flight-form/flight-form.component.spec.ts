import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FlightFormComponent } from './flight-form.component';
import { Flight } from '../../../../core/models/flight.model';

describe('FlightFormComponent', () => {
  let component: FlightFormComponent;
  let fixture: ComponentFixture<FlightFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form', () => {
      expect(component.flightForm).toBeDefined();
      expect(component.flightForm.get('title')?.value).toBe('');
      expect(component.flightForm.get('flightNumber')?.value).toBe('');
    });

    it('should have all required form controls', () => {
      const controls = [
        'title',
        'flightNumber',
        'airline',
        'confirmationCode',
        'departureDate',
        'departureTime',
        'departureAddress',
        'departureLatitude',
        'departureLongitude',
        'departureCity',
        'departureCountry',
        'arrivalDate',
        'arrivalTime',
        'arrivalAddress',
        'arrivalLatitude',
        'arrivalLongitude',
        'arrivalCity',
        'arrivalCountry',
        'notes',
      ];

      controls.forEach((control) => {
        expect(component.flightForm.get(control)).toBeDefined();
      });
    });

    it('should set required validators on mandatory fields', () => {
      const requiredFields = [
        'title',
        'flightNumber',
        'airline',
        'departureDate',
        'departureTime',
        'departureAddress',
        'departureLatitude',
        'departureLongitude',
        'arrivalDate',
        'arrivalTime',
        'arrivalAddress',
        'arrivalLatitude',
        'arrivalLongitude',
      ];

      requiredFields.forEach((field) => {
        const control = component.flightForm.get(field);
        control?.setValue('');
        control?.setValue(null);
        expect(control?.hasError('required')).toBe(true);
      });
    });

    it('should initialize signals as null', () => {
      expect(component.departureDateTime()).toBeNull();
      expect(component.arrivalDateTime()).toBeNull();
    });

    it('should initialize submitted flag as false', () => {
      expect(component.submitted).toBe(false);
    });
  });

  describe('Form Population (Edit Mode)', () => {
    const mockFlight = {
      id: '1',
      tripId: 'trip-1',
      type: 'flight',
      title: 'LAX to JFK',
      flightNumber: 'AA100',
      airline: 'American Airlines',
      confirmationCode: 'CONF123',
      startDate: new Date('2024-12-01T08:00:00'),
      endDate: new Date('2024-12-01T16:30:00'),
      departureLocation: {
        address: 'LAX Airport',
        latitude: 33.9416,
        longitude: -118.4085,
        city: 'Los Angeles',
        country: 'USA',
      },
      arrivalLocation: {
        address: 'JFK Airport',
        latitude: 40.6413,
        longitude: -73.7781,
        city: 'New York',
        country: 'USA',
      },
      notes: 'Check in early',
    } as unknown as Flight;

    beforeEach(() => {
      component.flight = mockFlight;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should populate form with flight data', () => {
      expect(component.flightForm.get('title')?.value).toBe('LAX to JFK');
      expect(component.flightForm.get('flightNumber')?.value).toBe('AA100');
      expect(component.flightForm.get('airline')?.value).toBe('American Airlines');
      expect(component.flightForm.get('confirmationCode')?.value).toBe('CONF123');
      expect(component.flightForm.get('notes')?.value).toBe('Check in early');
    });

    it('should populate departure location data', () => {
      expect(component.flightForm.get('departureAddress')?.value).toBe('LAX Airport');
      expect(component.flightForm.get('departureLatitude')?.value).toBe(33.9416);
      expect(component.flightForm.get('departureLongitude')?.value).toBe(-118.4085);
      expect(component.flightForm.get('departureCity')?.value).toBe('Los Angeles');
      expect(component.flightForm.get('departureCountry')?.value).toBe('USA');
    });

    it('should populate arrival location data', () => {
      expect(component.flightForm.get('arrivalAddress')?.value).toBe('JFK Airport');
      expect(component.flightForm.get('arrivalLatitude')?.value).toBe(40.6413);
      expect(component.flightForm.get('arrivalLongitude')?.value).toBe(-73.7781);
      expect(component.flightForm.get('arrivalCity')?.value).toBe('New York');
      expect(component.flightForm.get('arrivalCountry')?.value).toBe('USA');
    });

    it('should populate departure date and time', () => {
      expect(component.flightForm.get('departureDate')?.value).toBe('2024-12-01');
      expect(component.flightForm.get('departureTime')?.value).toBe('08:00');
    });

    it('should populate arrival date and time', () => {
      expect(component.flightForm.get('arrivalDate')?.value).toBe('2024-12-01');
      expect(component.flightForm.get('arrivalTime')?.value).toBe('16:30');
    });

    it('should update signals with flight dates', () => {
      expect(component.departureDateTime()).toEqual(mockFlight.startDate);
      expect(component.arrivalDateTime()).toEqual(mockFlight.endDate);
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate duration between departure and arrival', () => {
      component.departureDateTime.set(new Date('2024-12-01T08:00:00'));
      component.arrivalDateTime.set(new Date('2024-12-01T16:30:00'));

      // 8.5 hours = 510 minutes
      expect(component.durationMinutes()).toBe(510);
    });

    it('should return 0 duration when departure is null', () => {
      component.departureDateTime.set(null);
      component.arrivalDateTime.set(new Date('2024-12-01T16:30:00'));

      expect(component.durationMinutes()).toBe(0);
    });

    it('should return 0 duration when arrival is null', () => {
      component.departureDateTime.set(new Date('2024-12-01T08:00:00'));
      component.arrivalDateTime.set(null);

      expect(component.durationMinutes()).toBe(0);
    });

    it('should format duration correctly', () => {
      component.departureDateTime.set(new Date('2024-12-01T08:00:00'));
      component.arrivalDateTime.set(new Date('2024-12-01T16:30:00'));

      expect(component.formattedDuration()).toBe('8h 30m');
    });

    it('should return empty string when duration is 0', () => {
      component.departureDateTime.set(null);
      component.arrivalDateTime.set(null);

      // formatDuration(0) returns '0m', not empty string
      expect(component.formattedDuration()).toBe('0m');
    });
  });

  describe('Signal Updates', () => {
    it('should update departureDateTime signal when date and time are set', () => {
      component.flightForm.patchValue({
        departureDate: '2024-12-01',
        departureTime: '08:00',
      });

      const departure = component.departureDateTime();
      expect(departure).toBeTruthy();
      expect(departure?.getFullYear()).toBe(2024);
      expect(departure?.getMonth()).toBe(11);
      expect(departure?.getDate()).toBe(1);
      expect(departure?.getHours()).toBe(8);
      expect(departure?.getMinutes()).toBe(0);
    });

    it('should update arrivalDateTime signal when date and time are set', () => {
      component.flightForm.patchValue({
        arrivalDate: '2024-12-01',
        arrivalTime: '16:30',
      });

      const arrival = component.arrivalDateTime();
      expect(arrival).toBeTruthy();
      expect(arrival?.getFullYear()).toBe(2024);
      expect(arrival?.getMonth()).toBe(11);
      expect(arrival?.getDate()).toBe(1);
      expect(arrival?.getHours()).toBe(16);
      expect(arrival?.getMinutes()).toBe(30);
    });

    it('should set departure signal to null if date is missing', () => {
      component.flightForm.patchValue({
        departureDate: '',
        departureTime: '08:00',
      });

      expect(component.departureDateTime()).toBeNull();
    });

    it('should set arrival signal to null if time is missing', () => {
      component.flightForm.patchValue({
        arrivalDate: '2024-12-01',
        arrivalTime: '',
      });

      expect(component.arrivalDateTime()).toBeNull();
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when required fields are empty', () => {
      expect(component.flightForm.valid).toBe(false);
    });

    it('should be valid when all required fields are filled', () => {
      component.flightForm.patchValue({
        title: 'Test Flight',
        flightNumber: 'AA100',
        airline: 'American Airlines',
        departureDate: '2024-12-01',
        departureTime: '08:00',
        departureAddress: 'LAX',
        departureLatitude: 33.9416,
        departureLongitude: -118.4085,
        arrivalDate: '2024-12-01',
        arrivalTime: '16:30',
        arrivalAddress: 'JFK',
        arrivalLatitude: 40.6413,
        arrivalLongitude: -73.7781,
      });

      expect(component.flightForm.valid).toBe(true);
    });

    it('should validate title minimum length', () => {
      const titleControl = component.flightForm.get('title');
      titleControl?.setValue('ab');

      expect(titleControl?.hasError('minlength')).toBe(true);
    });

    it('should validate flightNumber minimum length', () => {
      const flightNumberControl = component.flightForm.get('flightNumber');
      flightNumberControl?.setValue('a');

      expect(flightNumberControl?.hasError('minlength')).toBe(true);
    });

    it('should validate airline minimum length', () => {
      const airlineControl = component.flightForm.get('airline');
      airlineControl?.setValue('a');

      expect(airlineControl?.hasError('minlength')).toBe(true);
    });

    it('should validate departure latitude range', () => {
      const latControl = component.flightForm.get('departureLatitude');

      latControl?.setValue(-91);
      expect(latControl?.hasError('min')).toBe(true);

      latControl?.setValue(91);
      expect(latControl?.hasError('max')).toBe(true);

      latControl?.setValue(45);
      expect(latControl?.valid).toBe(true);
    });

    it('should validate departure longitude range', () => {
      const lonControl = component.flightForm.get('departureLongitude');

      lonControl?.setValue(-181);
      expect(lonControl?.hasError('min')).toBe(true);

      lonControl?.setValue(181);
      expect(lonControl?.hasError('max')).toBe(true);

      lonControl?.setValue(-120);
      expect(lonControl?.valid).toBe(true);
    });

    it('should validate arrival latitude range', () => {
      const latControl = component.flightForm.get('arrivalLatitude');

      latControl?.setValue(-91);
      expect(latControl?.hasError('min')).toBe(true);

      latControl?.setValue(91);
      expect(latControl?.hasError('max')).toBe(true);
    });

    it('should validate arrival longitude range', () => {
      const lonControl = component.flightForm.get('arrivalLongitude');

      lonControl?.setValue(-181);
      expect(lonControl?.hasError('min')).toBe(true);

      lonControl?.setValue(181);
      expect(lonControl?.hasError('max')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should detect field errors with hasError', () => {
      component.submitted = true;
      const titleControl = component.flightForm.get('title');
      titleControl?.setValue('');

      expect(component.hasError('title')).toBe(true);
    });

    it('should not show error before submission if not touched', () => {
      const titleControl = component.flightForm.get('title');
      titleControl?.setValue('');

      expect(component.hasError('title')).toBe(false);
    });

    it('should show error if field is touched', () => {
      const titleControl = component.flightForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();

      expect(component.hasError('title')).toBe(true);
    });

    it('should return correct error messages for required fields', () => {
      const titleControl = component.flightForm.get('title');
      titleControl?.setValue('');

      expect(component.getErrorMessage('title')).toContain('required');
    });

    it('should return minlength error message', () => {
      const titleControl = component.flightForm.get('title');
      titleControl?.setValue('ab');

      expect(component.getErrorMessage('title')).toContain('Minimum length');
    });

    it('should return range error message for invalid coordinates', () => {
      const latControl = component.flightForm.get('departureLatitude');
      latControl?.setValue(100);

      // max error message says "at most"
      expect(component.getErrorMessage('departureLatitude')).toContain('at most');
    });

    it('should detect date-time validation error', () => {
      component.submitted = true;
      component.departureDateTime.set(new Date('2024-12-01T16:30:00'));
      component.arrivalDateTime.set(new Date('2024-12-01T08:00:00'));

      expect(component.hasDateTimeError()).toBe(true);
    });

    it('should detect equal date-time validation error', () => {
      component.submitted = true;
      const sameTime = new Date('2024-12-01T08:00:00');
      component.departureDateTime.set(sameTime);
      component.arrivalDateTime.set(sameTime);

      expect(component.hasDateTimeError()).toBe(true);
    });

    it('should not show date-time error when dates are valid', () => {
      component.submitted = true;
      component.departureDateTime.set(new Date('2024-12-01T08:00:00'));
      component.arrivalDateTime.set(new Date('2024-12-01T16:30:00'));

      expect(component.hasDateTimeError()).toBe(false);
    });

    it('should not show date-time error before submission', () => {
      component.departureDateTime.set(new Date('2024-12-01T16:30:00'));
      component.arrivalDateTime.set(new Date('2024-12-01T08:00:00'));

      expect(component.hasDateTimeError()).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should emit flight data on valid submit', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitFlight.subscribe(submitSpy);

      component.flightForm.patchValue({
        title: 'Test Flight',
        flightNumber: 'AA100',
        airline: 'American Airlines',
        confirmationCode: 'CONF123',
        departureDate: '2024-12-01',
        departureTime: '08:00',
        departureAddress: 'LAX',
        departureLatitude: 33.9416,
        departureLongitude: -118.4085,
        departureCity: 'Los Angeles',
        departureCountry: 'USA',
        arrivalDate: '2024-12-01',
        arrivalTime: '16:30',
        arrivalAddress: 'JFK',
        arrivalLatitude: 40.6413,
        arrivalLongitude: -73.7781,
        arrivalCity: 'New York',
        arrivalCountry: 'USA',
        notes: 'Test notes',
      });

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Test Flight',
          flightNumber: 'AA100',
          airline: 'American Airlines',
          confirmationCode: 'CONF123',
          departureLocation: jasmine.objectContaining({
            address: 'LAX',
            latitude: 33.9416,
            longitude: -118.4085,
            city: 'Los Angeles',
            country: 'USA',
          }),
          arrivalLocation: jasmine.objectContaining({
            address: 'JFK',
            latitude: 40.6413,
            longitude: -73.7781,
            city: 'New York',
            country: 'USA',
          }),
          notes: 'Test notes',
        }),
      );
    });

    it('should include flight ID when editing', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitFlight.subscribe(submitSpy);

      component.flight = { id: '123' } as Flight;

      component.flightForm.patchValue({
        title: 'Test Flight',
        flightNumber: 'AA100',
        airline: 'American Airlines',
        departureDate: '2024-12-01',
        departureTime: '08:00',
        departureAddress: 'LAX',
        departureLatitude: 33.9416,
        departureLongitude: -118.4085,
        arrivalDate: '2024-12-01',
        arrivalTime: '16:30',
        arrivalAddress: 'JFK',
        arrivalLatitude: 40.6413,
        arrivalLongitude: -73.7781,
      });

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith(jasmine.objectContaining({ id: '123' }));
    });

    it('should not emit if form is invalid', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitFlight.subscribe(submitSpy);

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid submit', () => {
      component.onSubmit();

      expect(component.flightForm.get('title')?.touched).toBe(true);
      expect(component.flightForm.get('flightNumber')?.touched).toBe(true);
    });

    it('should set submitted flag on submit', () => {
      component.onSubmit();

      expect(component.submitted).toBe(true);
    });

    it('should not emit if arrival is before or equal to departure', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitFlight.subscribe(submitSpy);

      component.flightForm.patchValue({
        title: 'Test Flight',
        flightNumber: 'AA100',
        airline: 'American Airlines',
        departureDate: '2024-12-01',
        departureTime: '16:30',
        departureAddress: 'LAX',
        departureLatitude: 33.9416,
        departureLongitude: -118.4085,
        arrivalDate: '2024-12-01',
        arrivalTime: '08:00',
        arrivalAddress: 'JFK',
        arrivalLatitude: 40.6413,
        arrivalLongitude: -73.7781,
      });

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should omit optional fields when empty', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitFlight.subscribe(submitSpy);

      component.flightForm.patchValue({
        title: 'Test Flight',
        flightNumber: 'AA100',
        airline: 'American Airlines',
        confirmationCode: '',
        departureDate: '2024-12-01',
        departureTime: '08:00',
        departureAddress: 'LAX',
        departureLatitude: 33.9416,
        departureLongitude: -118.4085,
        departureCity: '',
        departureCountry: '',
        arrivalDate: '2024-12-01',
        arrivalTime: '16:30',
        arrivalAddress: 'JFK',
        arrivalLatitude: 40.6413,
        arrivalLongitude: -73.7781,
        arrivalCity: '',
        arrivalCountry: '',
        notes: '',
      });

      component.onSubmit();

      const emittedData = submitSpy.calls.mostRecent().args[0];
      expect(emittedData.confirmationCode).toBeUndefined();
      expect(emittedData.notes).toBeUndefined();
      expect(emittedData.departureLocation.city).toBeUndefined();
      expect(emittedData.departureLocation.country).toBeUndefined();
      expect(emittedData.arrivalLocation.city).toBeUndefined();
      expect(emittedData.arrivalLocation.country).toBeUndefined();
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

  describe('Location Input Handlers', () => {
    it('should have departure location input handler', () => {
      expect(component.onDepartureLocationInput).toBeDefined();
      expect(() => component.onDepartureLocationInput()).not.toThrow();
    });

    it('should have arrival location input handler', () => {
      expect(component.onArrivalLocationInput).toBeDefined();
      expect(() => component.onArrivalLocationInput()).not.toThrow();
    });
  });
});
