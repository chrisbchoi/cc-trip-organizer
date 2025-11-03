import { Component, EventEmitter, Input, OnInit, Output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Accommodation } from '../../../../core/models/accommodation.model';
import { Location } from '../../../../core/models/location.model';
import { calculateDuration, formatDuration } from '../../../../core/utils/date.utils';

/**
 * Accommodation Form Component
 * Form for creating and editing accommodation itinerary items
 */
@Component({
  selector: 'app-accommodation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './accommodation-form.component.html',
  styleUrl: './accommodation-form.component.scss',
})
export class AccommodationFormComponent implements OnInit {
  @Input() accommodation?: Accommodation;
  @Input() tripId?: string;
  @Output() submitAccommodation = new EventEmitter<Accommodation>();
  @Output() cancelForm = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  accommodationForm!: FormGroup;

  // Signals for reactive check-in/check-out date-time
  checkInDateTime = signal<Date | null>(null);
  checkOutDateTime = signal<Date | null>(null);

  // Computed signals for duration
  durationMinutes = computed(() => {
    const checkIn = this.checkInDateTime();
    const checkOut = this.checkOutDateTime();
    if (checkIn && checkOut && checkOut > checkIn) {
      return calculateDuration(checkIn, checkOut);
    }
    return 0;
  });

  formattedDuration = computed(() => {
    const minutes = this.durationMinutes();
    if (minutes > 0) {
      const nights = Math.floor(minutes / (60 * 24));
      const formatted = formatDuration(minutes);
      return `${formatted} (${nights} ${nights === 1 ? 'night' : 'nights'})`;
    }
    return '';
  });

  ngOnInit(): void {
    this.initializeForm();
    if (this.accommodation) {
      this.populateForm(this.accommodation);
    }
  }

  /**
   * Initialize the reactive form with validators
   */
  private initializeForm(): void {
    this.accommodationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      confirmationNumber: [''],
      phoneNumber: [''],
      checkInDate: ['', Validators.required],
      checkInTime: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      checkOutTime: ['', Validators.required],
      address: ['', Validators.required],
      latitude: ['', [Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.min(-180), Validators.max(180)]],
      city: [''],
      country: [''],
      notes: [''],
    });
  }

  /**
   * Populate form with existing accommodation data
   */
  private populateForm(accommodation: Accommodation): void {
    const checkInDate = this.formatDateForInput(accommodation.startDate);
    const checkInTime = this.formatTimeForInput(accommodation.startDate);
    const checkOutDate = this.formatDateForInput(accommodation.endDate);
    const checkOutTime = this.formatTimeForInput(accommodation.endDate);

    this.accommodationForm.patchValue({
      title: accommodation.title,
      name: accommodation.name,
      confirmationNumber: accommodation.confirmationNumber || '',
      phoneNumber: accommodation.phoneNumber || '',
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      address: accommodation.location?.address || '',
      latitude: accommodation.location?.latitude || '',
      longitude: accommodation.location?.longitude || '',
      city: accommodation.location?.city || '',
      country: accommodation.location?.country || '',
      notes: accommodation.notes || '',
    });

    // Update signals
    this.checkInDateTime.set(accommodation.startDate);
    this.checkOutDateTime.set(accommodation.endDate);
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

  /**
   * Update check-in signal when date or time changes
   */
  updateCheckInSignal(): void {
    const date = this.accommodationForm.get('checkInDate')?.value;
    const time = this.accommodationForm.get('checkInTime')?.value;
    if (date && time) {
      const dateTime = this.combineDateAndTime(date, time);
      this.checkInDateTime.set(dateTime);
    }
  }

  /**
   * Update check-out signal when date or time changes
   */
  updateCheckOutSignal(): void {
    const date = this.accommodationForm.get('checkOutDate')?.value;
    const time = this.accommodationForm.get('checkOutTime')?.value;
    if (date && time) {
      const dateTime = this.combineDateAndTime(date, time);
      this.checkOutDateTime.set(dateTime);
    }
  }

  /**
   * Combine date string and time string into Date object
   */
  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date(dateStr);
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.accommodationForm.invalid) {
      this.accommodationForm.markAllAsTouched();
      return;
    }

    const checkIn = this.checkInDateTime();
    const checkOut = this.checkOutDateTime();

    if (!checkIn || !checkOut) {
      return;
    }

    if (checkOut <= checkIn) {
      return;
    }

    const formValue = this.accommodationForm.value;

    const location: Location = {
      address: formValue.address,
      latitude: formValue.latitude ? parseFloat(formValue.latitude) : 0,
      longitude: formValue.longitude ? parseFloat(formValue.longitude) : 0,
      city: formValue.city || undefined,
      country: formValue.country || undefined,
    };

    const accommodationData: Partial<Accommodation> = {
      id: this.accommodation?.id,
      tripId: this.tripId || this.accommodation?.tripId,
      type: 'accommodation',
      title: formValue.title,
      name: formValue.name,
      startDate: checkIn,
      endDate: checkOut,
      location,
      confirmationNumber: formValue.confirmationNumber || undefined,
      phoneNumber: formValue.phoneNumber || undefined,
      notes: formValue.notes || undefined,
    };

    const accommodation = new Accommodation(accommodationData);
    this.submitAccommodation.emit(accommodation);
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.cancelForm.emit();
  }

  /**
   * Check if a form field has an error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.accommodationForm.get(fieldName);
    return !!(field?.hasError(errorType) && (field?.dirty || field?.touched));
  }

  /**
   * Get error message for a form field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.accommodationForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }
    if (field.hasError('min')) {
      return `Invalid ${this.getFieldLabel(fieldName).toLowerCase()} value`;
    }
    if (field.hasError('max')) {
      return `Invalid ${this.getFieldLabel(fieldName).toLowerCase()} value`;
    }
    return '';
  }

  /**
   * Get human-readable label for field
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      name: 'Accommodation name',
      confirmationNumber: 'Confirmation number',
      phoneNumber: 'Phone number',
      checkInDate: 'Check-in date',
      checkInTime: 'Check-in time',
      checkOutDate: 'Check-out date',
      checkOutTime: 'Check-out time',
      address: 'Address',
      latitude: 'Latitude',
      longitude: 'Longitude',
      city: 'City',
      country: 'Country',
      notes: 'Notes',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Check if check-in/check-out dates have an error (check-out <= check-in)
   */
  hasDateTimeError(): boolean {
    const checkIn = this.checkInDateTime();
    const checkOut = this.checkOutDateTime();
    if (!checkIn || !checkOut) {
      return false;
    }
    return checkOut <= checkIn;
  }
}
