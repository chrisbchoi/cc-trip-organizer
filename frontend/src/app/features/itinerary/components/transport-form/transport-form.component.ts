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
import { Transport, TransportType } from '../../../../core/models/transport.model';
import { Location } from '../../../../core/models/location.model';
import { calculateDuration, formatDuration } from '../../../../core/utils/date.utils';

/**
 * TransportFormComponent
 *
 * Presentation component for creating or editing transport itinerary items.
 * Uses reactive forms with automatic duration calculation via signals.
 */
@Component({
  selector: 'app-transport-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transport-form.component.html',
  styleUrl: './transport-form.component.scss',
})
export class TransportFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  /**
   * Optional transport to edit. If provided, form will be pre-populated.
   */
  @Input() transport?: Transport;

  /**
   * Trip ID to associate with the new transport
   */
  @Input() tripId?: string;

  /**
   * Emits the transport data when form is submitted
   */
  @Output() submitTransport = new EventEmitter<Partial<Transport>>();

  /**
   * Emits when user cancels the form
   */
  @Output() cancelForm = new EventEmitter<void>();

  /**
   * Reactive form group for transport data
   */
  transportForm!: FormGroup;

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

  /**
   * Available transport types
   */
  transportTypes: { value: TransportType; label: string }[] = [
    { value: 'train', label: 'Train' },
    { value: 'bus', label: 'Bus' },
    { value: 'car', label: 'Car / Rental' },
    { value: 'ferry', label: 'Ferry / Boat' },
    { value: 'other', label: 'Other' },
  ];

  ngOnInit(): void {
    this.initializeForm();

    // If editing existing transport, populate form
    if (this.transport) {
      this.populateForm(this.transport);
    }
  }

  /**
   * Initialize the reactive form with validation rules
   */
  private initializeForm(): void {
    this.transportForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      transportType: ['', Validators.required],
      provider: [''],
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
    this.transportForm
      .get('departureDate')
      ?.valueChanges.subscribe(() => this.updateDepartureSignal());
    this.transportForm
      .get('departureTime')
      ?.valueChanges.subscribe(() => this.updateDepartureSignal());
    this.transportForm.get('arrivalDate')?.valueChanges.subscribe(() => this.updateArrivalSignal());
    this.transportForm.get('arrivalTime')?.valueChanges.subscribe(() => this.updateArrivalSignal());
  }

  /**
   * Populate form with existing transport data
   */
  private populateForm(transport: Transport): void {
    // Convert dates to input format (YYYY-MM-DD and HH:mm)
    const departureDate = this.formatDateForInput(transport.startDate);
    const departureTime = this.formatTimeForInput(transport.startDate);
    const arrivalDate = this.formatDateForInput(transport.endDate);
    const arrivalTime = this.formatTimeForInput(transport.endDate);

    this.transportForm.patchValue({
      title: transport.title,
      transportType: transport.transportType,
      provider: transport.provider || '',
      confirmationCode: transport.confirmationCode || '',
      departureDate,
      departureTime,
      departureAddress: transport.departureLocation.address,
      departureLatitude: transport.departureLocation.latitude,
      departureLongitude: transport.departureLocation.longitude,
      departureCity: transport.departureLocation.city || '',
      departureCountry: transport.departureLocation.country || '',
      arrivalDate,
      arrivalTime,
      arrivalAddress: transport.arrivalLocation.address,
      arrivalLatitude: transport.arrivalLocation.latitude,
      arrivalLongitude: transport.arrivalLocation.longitude,
      arrivalCity: transport.arrivalLocation.city || '',
      arrivalCountry: transport.arrivalLocation.country || '',
      notes: transport.notes || '',
    });

    // Update signals
    this.departureDateTime.set(transport.startDate);
    this.arrivalDateTime.set(transport.endDate);
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
    const dateStr = this.transportForm.get('departureDate')?.value;
    const timeStr = this.transportForm.get('departureTime')?.value;

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
    const dateStr = this.transportForm.get('arrivalDate')?.value;
    const timeStr = this.transportForm.get('arrivalTime')?.value;

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

    if (this.transportForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.transportForm.controls).forEach((key) => {
        this.transportForm.get(key)?.markAsTouched();
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

    const formValue = this.transportForm.value;

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

    // Build transport data (excluding type and tripId - handled by backend)
    const transportData: Partial<Transport> = {
      title: formValue.title,
      transportType: formValue.transportType,
      provider: formValue.provider || undefined,
      confirmationCode: formValue.confirmationCode || undefined,
      startDate: departure,
      endDate: arrival,
      departureLocation,
      arrivalLocation,
      notes: formValue.notes || undefined,
    };

    // If editing, include the ID
    if (this.transport?.id) {
      transportData.id = this.transport.id;
    }

    this.submitTransport.emit(transportData);
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
    const field = this.transportForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.submitted));
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.transportForm.get(fieldName);

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
