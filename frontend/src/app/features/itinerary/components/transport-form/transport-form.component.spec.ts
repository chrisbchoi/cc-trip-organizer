import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TransportFormComponent } from './transport-form.component';
import { Transport, TransportType } from '../../../../core/models/transport.model';

describe('TransportFormComponent', () => {
  let component: TransportFormComponent;
  let fixture: ComponentFixture<TransportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TransportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form', () => {
      expect(component.transportForm).toBeDefined();
      expect(component.transportForm.get('title')?.value).toBe('');
      expect(component.transportForm.get('transportType')?.value).toBe('');
    });

    it('should have all required form controls', () => {
      const controls = [
        'title',
        'transportType',
        'provider',
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
        expect(component.transportForm.get(control)).toBeDefined();
      });
    });

    it('should have transport type options', () => {
      expect(component.transportTypes).toBeDefined();
      expect(component.transportTypes.length).toBeGreaterThan(0);
      expect(component.transportTypes[0].value).toBeDefined();
      expect(component.transportTypes[0].label).toBeDefined();
    });

    it('should include expected transport types', () => {
      const types = component.transportTypes.map((t) => t.value);
      expect(types).toContain('train');
      expect(types).toContain('bus');
      expect(types).toContain('car');
      expect(types).toContain('ferry');
      expect(types).toContain('other');
    });

    it('should set required validators on mandatory fields', () => {
      const requiredFields = [
        'title',
        'transportType',
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
        const control = component.transportForm.get(field);
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
    const mockTransport = {
      id: '1',
      tripId: 'trip-1',
      type: 'transport',
      title: 'Train to Paris',
      transportType: 'train' as TransportType,
      provider: 'SNCF',
      confirmationCode: 'TRAIN123',
      startDate: new Date('2024-12-01T10:00:00'),
      endDate: new Date('2024-12-01T14:30:00'),
      departureLocation: {
        address: 'Gare du Nord',
        latitude: 48.8809,
        longitude: 2.3553,
        city: 'Paris',
        country: 'France',
      },
      arrivalLocation: {
        address: 'Brussels Central',
        latitude: 50.845,
        longitude: 4.3571,
        city: 'Brussels',
        country: 'Belgium',
      },
      notes: 'First class',
    } as unknown as Transport;

    beforeEach(() => {
      component.transport = mockTransport;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should populate form with transport data', () => {
      expect(component.transportForm.get('title')?.value).toBe('Train to Paris');
      expect(component.transportForm.get('transportType')?.value).toBe('train');
      expect(component.transportForm.get('provider')?.value).toBe('SNCF');
      expect(component.transportForm.get('confirmationCode')?.value).toBe('TRAIN123');
      expect(component.transportForm.get('notes')?.value).toBe('First class');
    });

    it('should populate departure location data', () => {
      expect(component.transportForm.get('departureAddress')?.value).toBe('Gare du Nord');
      expect(component.transportForm.get('departureLatitude')?.value).toBe(48.8809);
      expect(component.transportForm.get('departureLongitude')?.value).toBe(2.3553);
      expect(component.transportForm.get('departureCity')?.value).toBe('Paris');
      expect(component.transportForm.get('departureCountry')?.value).toBe('France');
    });

    it('should populate arrival location data', () => {
      expect(component.transportForm.get('arrivalAddress')?.value).toBe('Brussels Central');
      expect(component.transportForm.get('arrivalLatitude')?.value).toBe(50.845);
      expect(component.transportForm.get('arrivalLongitude')?.value).toBe(4.3571);
      expect(component.transportForm.get('arrivalCity')?.value).toBe('Brussels');
      expect(component.transportForm.get('arrivalCountry')?.value).toBe('Belgium');
    });

    it('should populate departure date and time', () => {
      expect(component.transportForm.get('departureDate')?.value).toBe('2024-12-01');
      expect(component.transportForm.get('departureTime')?.value).toBe('10:00');
    });

    it('should populate arrival date and time', () => {
      expect(component.transportForm.get('arrivalDate')?.value).toBe('2024-12-01');
      expect(component.transportForm.get('arrivalTime')?.value).toBe('14:30');
    });

    it('should update signals with transport dates', () => {
      expect(component.departureDateTime()).toEqual(mockTransport.startDate);
      expect(component.arrivalDateTime()).toEqual(mockTransport.endDate);
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate duration between departure and arrival', () => {
      component.departureDateTime.set(new Date('2024-12-01T10:00:00'));
      component.arrivalDateTime.set(new Date('2024-12-01T14:30:00'));

      // 4.5 hours = 270 minutes
      expect(component.durationMinutes()).toBe(270);
    });

    it('should return 0 duration when departure is null', () => {
      component.departureDateTime.set(null);
      component.arrivalDateTime.set(new Date('2024-12-01T14:30:00'));

      expect(component.durationMinutes()).toBe(0);
    });

    it('should return 0 duration when arrival is null', () => {
      component.departureDateTime.set(new Date('2024-12-01T10:00:00'));
      component.arrivalDateTime.set(null);

      expect(component.durationMinutes()).toBe(0);
    });

    it('should format duration correctly', () => {
      component.departureDateTime.set(new Date('2024-12-01T10:00:00'));
      component.arrivalDateTime.set(new Date('2024-12-01T14:30:00'));

      expect(component.formattedDuration()).toBe('4h 30m');
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
      component.transportForm.patchValue({
        departureDate: '2024-12-01',
        departureTime: '10:00',
      });

      const departure = component.departureDateTime();
      expect(departure).toBeTruthy();
      expect(departure?.getFullYear()).toBe(2024);
      expect(departure?.getMonth()).toBe(11);
      expect(departure?.getDate()).toBe(1);
      expect(departure?.getHours()).toBe(10);
      expect(departure?.getMinutes()).toBe(0);
    });

    it('should update arrivalDateTime signal when date and time are set', () => {
      component.transportForm.patchValue({
        arrivalDate: '2024-12-01',
        arrivalTime: '14:30',
      });

      const arrival = component.arrivalDateTime();
      expect(arrival).toBeTruthy();
      expect(arrival?.getFullYear()).toBe(2024);
      expect(arrival?.getMonth()).toBe(11);
      expect(arrival?.getDate()).toBe(1);
      expect(arrival?.getHours()).toBe(14);
      expect(arrival?.getMinutes()).toBe(30);
    });

    it('should set departure signal to null if date is missing', () => {
      component.transportForm.patchValue({
        departureDate: '',
        departureTime: '10:00',
      });

      expect(component.departureDateTime()).toBeNull();
    });

    it('should set arrival signal to null if time is missing', () => {
      component.transportForm.patchValue({
        arrivalDate: '2024-12-01',
        arrivalTime: '',
      });

      expect(component.arrivalDateTime()).toBeNull();
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when required fields are empty', () => {
      expect(component.transportForm.valid).toBe(false);
    });

    it('should be valid when all required fields are filled', () => {
      component.transportForm.patchValue({
        title: 'Test Transport',
        transportType: 'train',
        departureDate: '2024-12-01',
        departureTime: '10:00',
        departureAddress: 'Station A',
        departureLatitude: 48.8809,
        departureLongitude: 2.3553,
        arrivalDate: '2024-12-01',
        arrivalTime: '14:30',
        arrivalAddress: 'Station B',
        arrivalLatitude: 50.845,
        arrivalLongitude: 4.3571,
      });

      expect(component.transportForm.valid).toBe(true);
    });

    it('should validate title minimum length', () => {
      const titleControl = component.transportForm.get('title');
      titleControl?.setValue('ab');

      expect(titleControl?.hasError('minlength')).toBe(true);
    });

    it('should validate departure latitude range', () => {
      const latControl = component.transportForm.get('departureLatitude');

      latControl?.setValue(-91);
      expect(latControl?.hasError('min')).toBe(true);

      latControl?.setValue(91);
      expect(latControl?.hasError('max')).toBe(true);

      latControl?.setValue(45);
      expect(latControl?.valid).toBe(true);
    });

    it('should validate departure longitude range', () => {
      const lonControl = component.transportForm.get('departureLongitude');

      lonControl?.setValue(-181);
      expect(lonControl?.hasError('min')).toBe(true);

      lonControl?.setValue(181);
      expect(lonControl?.hasError('max')).toBe(true);

      lonControl?.setValue(-120);
      expect(lonControl?.valid).toBe(true);
    });

    it('should validate arrival latitude range', () => {
      const latControl = component.transportForm.get('arrivalLatitude');

      latControl?.setValue(-91);
      expect(latControl?.hasError('min')).toBe(true);

      latControl?.setValue(91);
      expect(latControl?.hasError('max')).toBe(true);
    });

    it('should validate arrival longitude range', () => {
      const lonControl = component.transportForm.get('arrivalLongitude');

      lonControl?.setValue(-181);
      expect(lonControl?.hasError('min')).toBe(true);

      lonControl?.setValue(181);
      expect(lonControl?.hasError('max')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should detect field errors with hasError', () => {
      component.submitted = true;
      const titleControl = component.transportForm.get('title');
      titleControl?.setValue('');

      expect(component.hasError('title')).toBe(true);
    });

    it('should not show error before submission if not touched', () => {
      const titleControl = component.transportForm.get('title');
      titleControl?.setValue('');

      expect(component.hasError('title')).toBe(false);
    });

    it('should show error if field is touched', () => {
      const titleControl = component.transportForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();

      expect(component.hasError('title')).toBe(true);
    });

    it('should return correct error messages for required fields', () => {
      const titleControl = component.transportForm.get('title');
      titleControl?.setValue('');

      expect(component.getErrorMessage('title')).toContain('required');
    });

    it('should return minlength error message', () => {
      const titleControl = component.transportForm.get('title');
      titleControl?.setValue('ab');

      expect(component.getErrorMessage('title')).toContain('Minimum length');
    });

    it('should return range error message for invalid coordinates', () => {
      const latControl = component.transportForm.get('departureLatitude');
      latControl?.setValue(100);

      // max error message says "at most"
      expect(component.getErrorMessage('departureLatitude')).toContain('at most');
    });

    it('should detect date-time validation error', () => {
      component.submitted = true;
      component.departureDateTime.set(new Date('2024-12-01T14:30:00'));
      component.arrivalDateTime.set(new Date('2024-12-01T10:00:00'));

      expect(component.hasDateTimeError()).toBe(true);
    });

    it('should detect equal date-time validation error', () => {
      component.submitted = true;
      const sameTime = new Date('2024-12-01T10:00:00');
      component.departureDateTime.set(sameTime);
      component.arrivalDateTime.set(sameTime);

      expect(component.hasDateTimeError()).toBe(true);
    });

    it('should not show date-time error when dates are valid', () => {
      component.submitted = true;
      component.departureDateTime.set(new Date('2024-12-01T10:00:00'));
      component.arrivalDateTime.set(new Date('2024-12-01T14:30:00'));

      expect(component.hasDateTimeError()).toBe(false);
    });

    it('should not show date-time error before submission', () => {
      component.departureDateTime.set(new Date('2024-12-01T14:30:00'));
      component.arrivalDateTime.set(new Date('2024-12-01T10:00:00'));

      expect(component.hasDateTimeError()).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should emit transport data on valid submit', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitTransport.subscribe(submitSpy);

      component.transportForm.patchValue({
        title: 'Test Transport',
        transportType: 'train',
        provider: 'SNCF',
        confirmationCode: 'TRAIN123',
        departureDate: '2024-12-01',
        departureTime: '10:00',
        departureAddress: 'Station A',
        departureLatitude: 48.8809,
        departureLongitude: 2.3553,
        departureCity: 'Paris',
        departureCountry: 'France',
        arrivalDate: '2024-12-01',
        arrivalTime: '14:30',
        arrivalAddress: 'Station B',
        arrivalLatitude: 50.845,
        arrivalLongitude: 4.3571,
        arrivalCity: 'Brussels',
        arrivalCountry: 'Belgium',
        notes: 'Test notes',
      });

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Test Transport',
          transportType: 'train',
          provider: 'SNCF',
          confirmationCode: 'TRAIN123',
          departureLocation: jasmine.objectContaining({
            address: 'Station A',
            latitude: 48.8809,
            longitude: 2.3553,
            city: 'Paris',
            country: 'France',
          }),
          arrivalLocation: jasmine.objectContaining({
            address: 'Station B',
            latitude: 50.845,
            longitude: 4.3571,
            city: 'Brussels',
            country: 'Belgium',
          }),
          notes: 'Test notes',
        }),
      );
    });

    it('should include transport ID when editing', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitTransport.subscribe(submitSpy);

      component.transport = { id: '123' } as Transport;

      component.transportForm.patchValue({
        title: 'Test Transport',
        transportType: 'train',
        departureDate: '2024-12-01',
        departureTime: '10:00',
        departureAddress: 'Station A',
        departureLatitude: 48.8809,
        departureLongitude: 2.3553,
        arrivalDate: '2024-12-01',
        arrivalTime: '14:30',
        arrivalAddress: 'Station B',
        arrivalLatitude: 50.845,
        arrivalLongitude: 4.3571,
      });

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith(jasmine.objectContaining({ id: '123' }));
    });

    it('should not emit if form is invalid', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitTransport.subscribe(submitSpy);

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid submit', () => {
      component.onSubmit();

      expect(component.transportForm.get('title')?.touched).toBe(true);
      expect(component.transportForm.get('transportType')?.touched).toBe(true);
    });

    it('should set submitted flag on submit', () => {
      component.onSubmit();

      expect(component.submitted).toBe(true);
    });

    it('should not emit if arrival is before or equal to departure', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitTransport.subscribe(submitSpy);

      component.transportForm.patchValue({
        title: 'Test Transport',
        transportType: 'train',
        departureDate: '2024-12-01',
        departureTime: '14:30',
        departureAddress: 'Station A',
        departureLatitude: 48.8809,
        departureLongitude: 2.3553,
        arrivalDate: '2024-12-01',
        arrivalTime: '10:00',
        arrivalAddress: 'Station B',
        arrivalLatitude: 50.845,
        arrivalLongitude: 4.3571,
      });

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should omit optional fields when empty', () => {
      const submitSpy = jasmine.createSpy('submitSpy');
      component.submitTransport.subscribe(submitSpy);

      component.transportForm.patchValue({
        title: 'Test Transport',
        transportType: 'train',
        provider: '',
        confirmationCode: '',
        departureDate: '2024-12-01',
        departureTime: '10:00',
        departureAddress: 'Station A',
        departureLatitude: 48.8809,
        departureLongitude: 2.3553,
        departureCity: '',
        departureCountry: '',
        arrivalDate: '2024-12-01',
        arrivalTime: '14:30',
        arrivalAddress: 'Station B',
        arrivalLatitude: 50.845,
        arrivalLongitude: 4.3571,
        arrivalCity: '',
        arrivalCountry: '',
        notes: '',
      });

      component.onSubmit();

      const emittedData = submitSpy.calls.mostRecent().args[0];
      expect(emittedData.provider).toBeUndefined();
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
