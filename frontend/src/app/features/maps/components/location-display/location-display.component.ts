import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '../../../../core/models/location.model';
import { MapsService } from '../../services/maps.service';

/**
 * LocationDisplayComponent
 *
 * Presentation component that displays a location with a link to view on Google Maps.
 *
 * Features:
 * - Displays location address and city
 * - Provides a button/link to view the location on Google Maps
 * - Opens map in a new tab
 * - Shows a map icon for visual clarity
 * - Validates location has required geocoding data
 *
 * Usage:
 * <app-location-display [location]="locationObject"></app-location-display>
 */
@Component({
  selector: 'app-location-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-display.component.html',
  styleUrl: './location-display.component.scss',
})
export class LocationDisplayComponent {
  /**
   * Location object to display
   */
  @Input() location?: Location;

  /**
   * Optional label/name for the location
   */
  @Input() label?: string;

  /**
   * Whether to show the full address or just city/country
   */
  @Input() showFullAddress = true;

  /**
   * Whether to show the map link button
   */
  @Input() showMapLink = true;

  /**
   * Inject MapsService for URL generation
   */
  private mapsService = inject(MapsService);

  /**
   * Get the display text for the location
   */
  get displayText(): string {
    if (!this.location) {
      return 'No location';
    }

    if (this.showFullAddress) {
      return this.location.formattedAddress || this.location.address;
    }

    // Show city, country if available
    if (this.location.city && this.location.country) {
      return `${this.location.city}, ${this.location.country}`;
    }
    if (this.location.city) {
      return this.location.city;
    }

    // Fall back to address
    return this.location.address;
  }

  /**
   * Get the city and country text (for subtitle)
   */
  get cityCountryText(): string | null {
    if (!this.location || !this.showFullAddress) {
      return null;
    }

    if (this.location.city && this.location.country) {
      return `${this.location.city}, ${this.location.country}`;
    }
    if (this.location.city) {
      return this.location.city;
    }

    return null;
  }

  /**
   * Check if location is valid and has geocoding data
   */
  get isLocationValid(): boolean {
    return this.location ? this.mapsService.isLocationGeocoded(this.location) : false;
  }

  /**
   * Get the Google Maps URL for this location
   */
  get mapUrl(): string {
    if (!this.location || !this.isLocationValid) {
      return '';
    }

    if (this.label) {
      return this.mapsService.getShareableMapUrl(this.location, this.label);
    }

    return this.mapsService.getMapUrl(this.location);
  }

  /**
   * Open the location in Google Maps
   */
  openInMaps(): void {
    if (this.mapUrl) {
      window.open(this.mapUrl, '_blank', 'noopener,noreferrer');
    }
  }
}
