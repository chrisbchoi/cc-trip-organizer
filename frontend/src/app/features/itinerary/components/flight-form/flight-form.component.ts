import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Flight } from '../../../../core/models/flight.model';
import { Location } from '../../../../core/models/location.model';
import { calculateDuration, formatDuration } from '../../../../core/utils/date.utils';

/**
 * FlightFormComponent
 *
 * Presentation component for creating or editing flight itinerary items.
 * Uses reactive forms with automatic duration calculation via signals.
 */
@Component({
  selector: 'app-flight-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flight-form.component.html',
  styleUrl: './flight-form.component.scss',
})
export class FlightFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  /**
   * Optional flight to edit. If provided, form will be pre-populated.
   */
  @Input() flight?: Flight;

  /**
   * Trip ID to associate with the new flight
   */
  @Input() tripId?: string;

  /**
   * Emits the flight data when form is submitted
   */
  @Output() submitFlight = new EventEmitter<Partial<Flight>>();

  /**
   * Emits when user cancels the form
   */
  @Output() cancelForm = new EventEmitter<void>();

  /**
   * Reactive form group for flight data
   */
  flightForm!: FormGroup;

  /**
   * Signal for departure date/time
   */
  departureDateTime = signal<Date | null>(null);

  /**
   * Signal for arrival date/time
   */
  arrivalDateTime = signal<Date | null>(null);

  /**
   * Computed duration in minutes based on departure and arrival times
   */
  durationMinutes = computed(() => {
    const departure = this.departureDateTime();
    const arrival = this.arrivalDateTime();

    if (!departure || !arrival) {
      return 0;
    }

    return calculateDuration(departure, arrival);
  });

  /**
   * Computed formatted duration string (e.g., "2h 30m")
   */
  formattedDuration = computed(() => {
    return formatDuration(this.durationMinutes());
  });

  /**
   * Flag to show validation errors
   */
  submitted = false;

  ngOnInit(): void {
    this.initializeForm();

    // If editing existing flight, populate form
    if (this.flight) {
      this.populateForm(this.flight);
    }
  }

  /**
   * Initialize the reactive form with validation rules
   */
  private initializeForm(): void {
    this.flightForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      flightNumber: ['', [Validators.required, Validators.minLength(2)]],
      airline: ['', [Validators.required, Validators.minLength(2)]],
      confirmationCode: [''],
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      departureAddress: ['', Validators.required],
      departureLatitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      departureLongitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      departureCity: [''],
      departureCountry: [''],
      arrivalDate: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      arrivalAddress: ['', Validators.required],
      arrivalLatitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      arrivalLongitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      arrivalCity: [''],
      arrivalCountry: [''],
      notes: [''],
    });

    // Subscribe to date/time changes to update signals
    this.flightForm
      .get('departureDate')
      ?.valueChanges.subscribe(() => this.updateDepartureSignal());
    this.flightForm
      .get('departureTime')
      ?.valueChanges.subscribe(() => this.updateDepartureSignal());
    this.flightForm.get('arrivalDate')?.valueChanges.subscribe(() => this.updateArrivalSignal());
    this.flightForm.get('arrivalTime')?.valueChanges.subscribe(() => this.updateArrivalSignal());
  }

  /**
   * Populate form with existing flight data
   */
  private populateForm(flight: Flight): void {
    // Convert dates to input format (YYYY-MM-DD and HH:mm)
    const departureDate = this.formatDateForInput(flight.startDate);
    const departureTime = this.formatTimeForInput(flight.startDate);
    const arrivalDate = this.formatDateForInput(flight.endDate);
    const arrivalTime = this.formatTimeForInput(flight.endDate);

    this.flightForm.patchValue({
      title: flight.title,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      confirmationCode: flight.confirmationCode || '',
      departureDate,
      departureTime,
      departureAddress: flight.departureLocation.address,
      departureLatitude: flight.departureLocation.latitude,
      departureLongitude: flight.departureLocation.longitude,
      departureCity: flight.departureLocation.city || '',
      departureCountry: flight.departureLocation.country || '',
      arrivalDate,
      arrivalTime,
      arrivalAddress: flight.arrivalLocation.address,
      arrivalLatitude: flight.arrivalLocation.latitude,
      arrivalLongitude: flight.arrivalLocation.longitude,
      arrivalCity: flight.arrivalLocation.city || '',
      arrivalCountry: flight.arrivalLocation.country || '',
      notes: flight.notes || '',
    });

    // Update signals
    this.departureDateTime.set(flight.startDate);
    this.arrivalDateTime.set(flight.endDate);
  }

  /**
   * Format date for HTML date input (YYYY-MM-DD)
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format time for HTML time input (HH:mm)
   */
  private formatTimeForInput(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Update departure signal when date or time changes
   */
  private updateDepartureSignal(): void {
    const dateStr = this.flightForm.get('departureDate')?.value;
    const timeStr = this.flightForm.get('departureTime')?.value;

    if (dateStr && timeStr) {
      const dateTime = this.combineDateAndTime(dateStr, timeStr);
      this.departureDateTime.set(dateTime);
    } else {
      this.departureDateTime.set(null);
    }
  }

  /**
   * Update arrival signal when date or time changes
   */
  private updateArrivalSignal(): void {
    const dateStr = this.flightForm.get('arrivalDate')?.value;
    const timeStr = this.flightForm.get('arrivalTime')?.value;

    if (dateStr && timeStr) {
      const dateTime = this.combineDateAndTime(dateStr, timeStr);
      this.arrivalDateTime.set(dateTime);
    } else {
      this.arrivalDateTime.set(null);
    }
  }

  /**
   * Combine date and time strings into a Date object
   */
  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    return new Date(`${dateStr}T${timeStr}:00`);
  }

  /**
   * Handle manual location input for departure
   */
  onDepartureLocationInput(): void {
    // TODO: Integrate with geocoding service when available
    // For now, user must manually enter coordinates
  }

  /**
   * Handle manual location input for arrival
   */
  onArrivalLocationInput(): void {
    // TODO: Integrate with geocoding service when available
    // For now, user must manually enter coordinates
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.flightForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.flightForm.controls).forEach((key) => {
        this.flightForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Validate that arrival is after departure
    const departure = this.departureDateTime();
    const arrival = this.arrivalDateTime();

    if (!departure || !arrival || arrival <= departure) {
      // Show error (could be enhanced with a proper error message display)
      console.error('Arrival time must be after departure time');
      return;
    }

    const formValue = this.flightForm.value;

    // Build departure location
    const departureLocation: Location = {
      address: formValue.departureAddress,
      latitude: formValue.departureLatitude,
      longitude: formValue.departureLongitude,
      city: formValue.departureCity || undefined,
      country: formValue.departureCountry || undefined,
    };

    // Build arrival location
    const arrivalLocation: Location = {
      address: formValue.arrivalAddress,
      latitude: formValue.arrivalLatitude,
      longitude: formValue.arrivalLongitude,
      city: formValue.arrivalCity || undefined,
      country: formValue.arrivalCountry || undefined,
    };

    // Build flight data (excluding type and tripId - handled by backend)
    const flightData: Partial<Flight> = {
      title: formValue.title,
      flightNumber: formValue.flightNumber,
      airline: formValue.airline,
      confirmationCode: formValue.confirmationCode || undefined,
      startDate: departure,
      endDate: arrival,
      departureLocation,
      arrivalLocation,
      notes: formValue.notes || undefined,
    };

    // If editing, include the ID
    if (this.flight?.id) {
      flightData.id = this.flight.id;
    }

    this.submitFlight.emit(flightData);
  }

  /**
   * Handle form cancellation
   */
  onCancel(): void {
    this.cancelForm.emit();
  }

  /**
   * Check if a field has an error and should show it
   */
  hasError(fieldName: string): boolean {
    const field = this.flightForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.submitted));
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.flightForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return 'This field is required';
    }

    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }

    if (field.errors['min']) {
      return `Value must be at least ${field.errors['min'].min}`;
    }

    if (field.errors['max']) {
      return `Value must be at most ${field.errors['max'].max}`;
    }

    return 'Invalid value';
  }

  /**
   * Check if the form has date/time validation errors
   */
  hasDateTimeError(): boolean {
    const departure = this.departureDateTime();
    const arrival = this.arrivalDateTime();

    return this.submitted && !!departure && !!arrival && arrival <= departure;
  }
}
