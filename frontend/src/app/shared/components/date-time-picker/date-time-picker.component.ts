import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

/**
 * Date Time Picker Component
 * Reusable component for selecting date and time
 * Implements ControlValueAccessor for seamless form integration
 */
@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './date-time-picker.component.html',
  styleUrl: './date-time-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true,
    },
  ],
})
export class DateTimePickerComponent implements ControlValueAccessor {
  @Input() label = 'Date & Time';
  @Input() dateLabel = 'Date';
  @Input() timeLabel = 'Time';
  @Input() required = false;
  @Input() minDate?: string;
  @Input() maxDate?: string;
  @Input() minTime?: string;
  @Input() maxTime?: string;

  dateControl = new FormControl('');
  timeControl = new FormControl('');

  disabled = false;

  // ControlValueAccessor callbacks
  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Handle date input change
   */
  onDateChange(): void {
    this.updateValue();
    this.onTouched();
  }

  /**
   * Handle time input change
   */
  onTimeChange(): void {
    this.updateValue();
    this.onTouched();
  }

  /**
   * Update the combined Date value
   */
  private updateValue(): void {
    const dateValue = this.dateControl.value;
    const timeValue = this.timeControl.value;

    if (dateValue && timeValue) {
      const combinedDate = this.combineDateAndTime(dateValue, timeValue);
      this.onChange(combinedDate);
    } else if (dateValue) {
      // Date only, default time to 00:00
      const combinedDate = this.combineDateAndTime(dateValue, '00:00');
      this.onChange(combinedDate);
    } else {
      this.onChange(null);
    }
  }

  /**
   * Combine date string and time string into Date object
   */
  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map((s) => parseInt(s, 10));
    const date = new Date(dateStr);
    date.setHours(hours || 0);
    date.setMinutes(minutes || 0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  /**
   * Format Date object for date input (YYYY-MM-DD)
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format Date object for time input (HH:MM)
   */
  private formatTimeForInput(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // ControlValueAccessor implementation

  /**
   * Write a new value to the component
   */
  writeValue(value: Date | null): void {
    if (value) {
      this.dateControl.setValue(this.formatDateForInput(value), {
        emitEvent: false,
      });
      this.timeControl.setValue(this.formatTimeForInput(value), {
        emitEvent: false,
      });
    } else {
      this.dateControl.setValue('', { emitEvent: false });
      this.timeControl.setValue('', { emitEvent: false });
    }
  }

  /**
   * Register onChange callback
   */
  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  /**
   * Register onTouched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.dateControl.disable({ emitEvent: false });
      this.timeControl.disable({ emitEvent: false });
    } else {
      this.dateControl.enable({ emitEvent: false });
      this.timeControl.enable({ emitEvent: false });
    }
  }

  /**
   * Check if date input has a value
   */
  hasDateValue(): boolean {
    return !!this.dateControl.value;
  }

  /**
   * Check if time input has a value
   */
  hasTimeValue(): boolean {
    return !!this.timeControl.value;
  }

  /**
   * Clear the date and time values
   */
  clear(): void {
    this.dateControl.setValue('', { emitEvent: false });
    this.timeControl.setValue('', { emitEvent: false });
    this.onChange(null);
    this.onTouched();
  }
}
