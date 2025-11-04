import { Component, OnInit, forwardRef, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { Location } from '../../../core/models/location.model';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

/**
 * Location Search Component
 * Reusable component for searching and selecting locations with geocoding
 * Implements ControlValueAccessor for seamless form integration
 */
@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './location-search.component.html',
  styleUrl: './location-search.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationSearchComponent),
      multi: true,
    },
  ],
})
export class LocationSearchComponent implements OnInit, ControlValueAccessor {
  private destroy$ = new Subject<void>();

  searchControl = new FormControl('');
  isLoading = signal(false);
  showSuggestions = signal(false);
  suggestions = signal<Location[]>([]);
  errorMessage = signal<string | null>(null);

  selectedLocation: Location | null = null;
  disabled = false;

  // ControlValueAccessor callbacks
  private onChange: (value: Location | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.setupSearchListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup listener for search input with debouncing
   */
  private setupSearchListener(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        if (query && query.length >= 3) {
          this.performGeocode(query);
        } else {
          this.suggestions.set([]);
          this.showSuggestions.set(false);
        }
      });
  }

  /**
   * Perform geocoding search
   * TODO: Replace with actual geocoding service call
   */
  private async performGeocode(query: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Simulate API call with mock data
      // In production, replace with actual geocoding service
      await this.delay(500);

      const mockResults = this.generateMockResults(query);
      this.suggestions.set(mockResults);
      this.showSuggestions.set(mockResults.length > 0);
    } catch (error) {
      this.errorMessage.set('Failed to fetch location suggestions');
      this.suggestions.set([]);
      this.showSuggestions.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Generate mock geocoding results for testing
   * TODO: Remove when real geocoding service is implemented
   */
  private generateMockResults(query: string): Location[] {
    const mockLocations: Location[] = [
      {
        address: `${query} Street, New York, NY`,
        formattedAddress: `${query} Street, New York, NY 10001, USA`,
        latitude: 40.7128 + Math.random() * 0.1,
        longitude: -74.006 + Math.random() * 0.1,
        city: 'New York',
        country: 'USA',
        placeId: `mock-place-id-${Date.now()}-1`,
      },
      {
        address: `${query} Avenue, Los Angeles, CA`,
        formattedAddress: `${query} Avenue, Los Angeles, CA 90001, USA`,
        latitude: 34.0522 + Math.random() * 0.1,
        longitude: -118.2437 + Math.random() * 0.1,
        city: 'Los Angeles',
        country: 'USA',
        placeId: `mock-place-id-${Date.now()}-2`,
      },
      {
        address: `${query} Road, Chicago, IL`,
        formattedAddress: `${query} Road, Chicago, IL 60601, USA`,
        latitude: 41.8781 + Math.random() * 0.1,
        longitude: -87.6298 + Math.random() * 0.1,
        city: 'Chicago',
        country: 'USA',
        placeId: `mock-place-id-${Date.now()}-3`,
      },
    ];

    return mockLocations;
  }

  /**
   * Handle suggestion selection
   */
  selectSuggestion(location: Location): void {
    this.selectedLocation = location;
    this.searchControl.setValue(location.formattedAddress || location.address, {
      emitEvent: false,
    });
    this.showSuggestions.set(false);
    this.onChange(location);
    this.onTouched();
  }

  /**
   * Clear the selected location
   */
  clearSelection(): void {
    this.selectedLocation = null;
    this.searchControl.setValue('', { emitEvent: false });
    this.suggestions.set([]);
    this.showSuggestions.set(false);
    this.onChange(null);
    this.onTouched();
  }

  /**
   * Handle input blur
   */
  onBlur(): void {
    this.onTouched();
    // Delay hiding suggestions to allow click events to fire
    setTimeout(() => {
      this.showSuggestions.set(false);
    }, 200);
  }

  /**
   * Handle input focus
   */
  onFocus(): void {
    if (this.suggestions().length > 0) {
      this.showSuggestions.set(true);
    }
  }

  // ControlValueAccessor implementation

  /**
   * Write a new value to the component
   */
  writeValue(value: Location | null): void {
    this.selectedLocation = value;
    if (value) {
      this.searchControl.setValue(value.formattedAddress || value.address, { emitEvent: false });
    } else {
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  /**
   * Register onChange callback
   */
  registerOnChange(fn: (value: Location | null) => void): void {
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
      this.searchControl.disable({ emitEvent: false });
    } else {
      this.searchControl.enable({ emitEvent: false });
    }
  }

  /**
   * Utility function to delay execution (for mock API calls)
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get display text for a location
   */
  getLocationDisplayText(location: Location): string {
    return location.formattedAddress || location.address;
  }

  /**
   * Get location details (city, country)
   */
  getLocationDetails(location: Location): string {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    return parts.join(', ');
  }
}
