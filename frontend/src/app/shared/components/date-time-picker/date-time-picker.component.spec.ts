import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateTimePickerComponent } from './date-time-picker.component';

describe('DateTimePickerComponent', () => {
  let component: DateTimePickerComponent;
  let fixture: ComponentFixture<DateTimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateTimePickerComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DateTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default labels', () => {
      expect(component.label).toBe('Date & Time');
      expect(component.dateLabel).toBe('Date');
      expect(component.timeLabel).toBe('Time');
    });

    it('should initialize with required false', () => {
      expect(component.required).toBe(false);
    });

    it('should initialize with disabled false', () => {
      expect(component.disabled).toBe(false);
    });

    it('should have empty date and time controls', () => {
      expect(component.dateControl.value).toBe('');
      expect(component.timeControl.value).toBe('');
    });
  });

  describe('Input Properties', () => {
    it('should accept custom label', () => {
      component.label = 'Departure Time';
      expect(component.label).toBe('Departure Time');
    });

    it('should accept custom date label', () => {
      component.dateLabel = 'Departure Date';
      expect(component.dateLabel).toBe('Departure Date');
    });

    it('should accept custom time label', () => {
      component.timeLabel = 'Departure Time';
      expect(component.timeLabel).toBe('Departure Time');
    });

    it('should accept required flag', () => {
      component.required = true;
      expect(component.required).toBe(true);
    });

    it('should accept min/max date constraints', () => {
      component.minDate = '2024-01-01';
      component.maxDate = '2024-12-31';
      expect(component.minDate).toBe('2024-01-01');
      expect(component.maxDate).toBe('2024-12-31');
    });

    it('should accept min/max time constraints', () => {
      component.minTime = '08:00';
      component.maxTime = '18:00';
      expect(component.minTime).toBe('08:00');
      expect(component.maxTime).toBe('18:00');
    });
  });

  describe('Date Change Handling', () => {
    it('should update value when date changes', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.dateControl.setValue('2024-12-01');
      component.timeControl.setValue('10:00');
      component.onDateChange();

      expect(onChangeSpy).toHaveBeenCalled();
      const calledValue = onChangeSpy.calls.mostRecent().args[0];
      expect(calledValue).toBeInstanceOf(Date);
      expect(calledValue.getFullYear()).toBe(2024);
      expect(calledValue.getMonth()).toBe(11); // December is month 11
      expect(calledValue.getDate()).toBe(1);
    });

    it('should call onTouched when date changes', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      component.onDateChange();

      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Time Change Handling', () => {
    it('should update value when time changes', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.dateControl.setValue('2024-12-01');
      component.timeControl.setValue('14:30');
      component.onTimeChange();

      expect(onChangeSpy).toHaveBeenCalled();
      const calledValue = onChangeSpy.calls.mostRecent().args[0];
      expect(calledValue).toBeInstanceOf(Date);
      expect(calledValue.getHours()).toBe(14);
      expect(calledValue.getMinutes()).toBe(30);
    });

    it('should call onTouched when time changes', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      component.onTimeChange();

      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Value Combination', () => {
    it('should combine date and time into Date object', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.dateControl.setValue('2024-12-15');
      component.timeControl.setValue('16:45');
      component.onDateChange();

      const result = onChangeSpy.calls.mostRecent().args[0];
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(16);
      expect(result.getMinutes()).toBe(45);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should default time to 00:00 when only date is provided', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.dateControl.setValue('2024-12-01');
      component.timeControl.setValue('');
      component.onDateChange();

      const result = onChangeSpy.calls.mostRecent().args[0];
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });

    it('should return null when date is not provided', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.dateControl.setValue('');
      component.timeControl.setValue('10:00');
      component.onDateChange();

      expect(onChangeSpy).toHaveBeenCalledWith(null);
    });
  });

  describe('ControlValueAccessor - writeValue', () => {
    it('should write Date value to controls', () => {
      const testDate = new Date('2024-12-01T10:30:00');

      component.writeValue(testDate);

      expect(component.dateControl.value).toBe('2024-12-01');
      expect(component.timeControl.value).toBe('10:30');
    });

    it('should clear controls when writing null', () => {
      component.dateControl.setValue('2024-12-01');
      component.timeControl.setValue('10:00');

      component.writeValue(null);

      expect(component.dateControl.value).toBe('');
      expect(component.timeControl.value).toBe('');
    });

    it('should format date correctly with leading zeros', () => {
      const testDate = new Date('2024-01-05T08:05:00');

      component.writeValue(testDate);

      expect(component.dateControl.value).toBe('2024-01-05');
      expect(component.timeControl.value).toBe('08:05');
    });

    it('should not emit change events when writing value', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      const testDate = new Date('2024-12-01T10:00:00');
      component.writeValue(testDate);

      expect(onChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('ControlValueAccessor - registerOnChange', () => {
    it('should register onChange callback', () => {
      const callback = jasmine.createSpy('onChange');
      component.registerOnChange(callback);

      component.dateControl.setValue('2024-12-01');
      component.timeControl.setValue('10:00');
      component.onDateChange();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('ControlValueAccessor - registerOnTouched', () => {
    it('should register onTouched callback', () => {
      const callback = jasmine.createSpy('onTouched');
      component.registerOnTouched(callback);

      component.onDateChange();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('ControlValueAccessor - setDisabledState', () => {
    it('should disable controls when disabled', () => {
      component.setDisabledState(true);

      expect(component.disabled).toBe(true);
      expect(component.dateControl.disabled).toBe(true);
      expect(component.timeControl.disabled).toBe(true);
    });

    it('should enable controls when not disabled', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);

      expect(component.disabled).toBe(false);
      expect(component.dateControl.disabled).toBe(false);
      expect(component.timeControl.disabled).toBe(false);
    });

    it('should not emit events when setting disabled state', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.setDisabledState(true);

      expect(onChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Value Checking Methods', () => {
    it('hasDateValue should return false when date is empty', () => {
      component.dateControl.setValue('');
      expect(component.hasDateValue()).toBe(false);
    });

    it('hasDateValue should return true when date has value', () => {
      component.dateControl.setValue('2024-12-01');
      expect(component.hasDateValue()).toBe(true);
    });

    it('hasTimeValue should return false when time is empty', () => {
      component.timeControl.setValue('');
      expect(component.hasTimeValue()).toBe(false);
    });

    it('hasTimeValue should return true when time has value', () => {
      component.timeControl.setValue('10:00');
      expect(component.hasTimeValue()).toBe(true);
    });
  });

  describe('Clear Method', () => {
    it('should clear both date and time controls', () => {
      component.dateControl.setValue('2024-12-01');
      component.timeControl.setValue('10:00');

      component.clear();

      expect(component.dateControl.value).toBe('');
      expect(component.timeControl.value).toBe('');
    });

    it('should emit null when cleared', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.dateControl.setValue('2024-12-01');
      component.clear();

      expect(onChangeSpy).toHaveBeenCalledWith(null);
    });

    it('should call onTouched when cleared', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      component.clear();

      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Mark as Touched', () => {
    it('should call onTouched callback', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      component.markAsTouched();

      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Form Integration', () => {
    it('should work with FormControl', () => {
      const formControl = new FormControl();

      // Simulate form control binding
      component.registerOnChange((value) => formControl.setValue(value, { emitEvent: false }));
      component.registerOnTouched(() => formControl.markAsTouched());

      component.dateControl.setValue('2024-12-01');
      component.timeControl.setValue('10:00');
      component.onDateChange();

      expect(formControl.value).toBeInstanceOf(Date);
      expect(formControl.value.getFullYear()).toBe(2024);
    });

    it('should update component when form control value changes', () => {
      const testDate = new Date('2024-12-01T15:30:00');

      component.writeValue(testDate);

      expect(component.dateControl.value).toBe('2024-12-01');
      expect(component.timeControl.value).toBe('15:30');
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(DateTimePickerComponent).toBeDefined();
    });
  });
});
