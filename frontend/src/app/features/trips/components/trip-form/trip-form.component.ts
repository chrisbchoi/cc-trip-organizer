import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Trip } from '../../../../core/models/trip.model';

/**
 * TripFormComponent
 * 
 * A reactive form for creating and editing trips with validation.
 * 
 * Features:
 * - Reactive form with FormBuilder
 * - Fields: title, description, startDate, endDate
 * - Required field validation
 * - Custom date range validation (endDate must be after startDate)
 * - Emits form data to parent component
 * - Cancel functionality
 * 
 * Usage:
 * ```html
 * <app-trip-form 
 *   [trip]="existingTrip"
 *   (save)="onSave($event)"
 *   (cancel)="onCancel()">
 * </app-trip-form>
 * ```
 */
@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trip-form.component.html',
  styleUrl: './trip-form.component.scss'
})
export class TripFormComponent implements OnInit {
  /**
   * Optional trip to edit. If provided, form will be populated with existing values.
   */
  @Input() trip?: Trip;

  /**
   * Emits when form is submitted with valid data.
   */
  @Output() save = new EventEmitter<Partial<Trip>>();

  /**
   * Emits when user cancels the form.
   */
  @Output() cancelForm = new EventEmitter<void>();

  /**
   * Reactive form group
   */
  tripForm!: FormGroup;

  /**
   * Track form submission attempt for showing validation errors
   */
  submitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // If editing an existing trip, populate the form
    if (this.trip) {
      this.populateForm(this.trip);
    }
  }

  /**
   * Initialize the reactive form with validators
   */
  private initializeForm(): void {
    this.tripForm = this.fb.group(
      {
        title: ['', [Validators.required, Validators.maxLength(200)]],
        description: ['', [Validators.maxLength(1000)]],
        startDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
      },
      {
        validators: this.dateRangeValidator,
      },
    );
  }

  /**
   * Populate form with existing trip data
   */
  private populateForm(trip: Trip): void {
    // Convert Date objects to ISO string format for date inputs (YYYY-MM-DD)
    const startDateStr =
      trip.startDate instanceof Date
        ? trip.startDate.toISOString().split('T')[0]
        : new Date(trip.startDate).toISOString().split('T')[0];

    const endDateStr =
      trip.endDate instanceof Date
        ? trip.endDate.toISOString().split('T')[0]
        : new Date(trip.endDate).toISOString().split('T')[0];

    this.tripForm.patchValue({
      title: trip.title,
      description: trip.description || '',
      startDate: startDateStr,
      endDate: endDateStr,
    });
  }

  /**
   * Custom validator to ensure end date is after start date
   */
  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (!startDate || !endDate) {
      return null; // Don't validate if either date is missing
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return { dateRange: 'End date must be after start date' };
    }

    return null;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.tripForm.valid) {
      const formValue = this.tripForm.value;

      // Convert date strings to Date objects
      const tripData: Partial<Trip> = {
        title: formValue.title.trim(),
        description: formValue.description?.trim() || '',
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
      };

      // Include ID if editing existing trip
      if (this.trip?.id) {
        tripData.id = this.trip.id;
      }

      this.save.emit(tripData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.tripForm.controls).forEach((key) => {
        this.tripForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.cancelForm.emit();
  }

  /**
   * Helper method to check if a field has an error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.tripForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.touched || this.submitted));
  }

  /**
   * Helper method to get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.tripForm.get(fieldName);
    
    if (!field || !(field.touched || this.submitted)) {
      return '';
    }

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `${this.getFieldLabel(fieldName)} must be less than ${maxLength} characters`;
    }

    return '';
  }

  /**
   * Get form-level date range error message
   */
  getDateRangeError(): string {
    if (this.tripForm.hasError('dateRange') && (this.submitted || this.tripForm.touched)) {
      return this.tripForm.errors?.['dateRange'];
    }
    return '';
  }

  /**
   * Get user-friendly field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      title: 'Title',
      description: 'Description',
      startDate: 'Start date',
      endDate: 'End date',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Check if form is in edit mode
   */
  get isEditMode(): boolean {
    return !!this.trip?.id;
  }
}
