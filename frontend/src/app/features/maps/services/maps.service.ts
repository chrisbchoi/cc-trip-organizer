import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Location } from '../../../core/models/location.model';

/**
 * Request payload for geocoding
 */
interface GeocodeRequest {
  address: string;
}

/**
 * Service for maps-related functionality
 * Handles geocoding, place details, and URL generation for Google Maps
 */
@Injectable({
  providedIn: 'root',
})
export class MapsService {
  private api = inject(ApiService);

  /**
   * Geocode an address to get location coordinates
   * @param address - Address string to geocode
   * @returns Observable of Location object with coordinates
   */
  geocodeAddress(address: string): Observable<Location> {
    const request: GeocodeRequest = { address };
    return this.api.post<Location>('maps/geocode', request);
  }

  /**
   * Get place details by Google Place ID
   * @param placeId - Google Places API place ID
   * @returns Observable of Location object with full details
   */
  getPlaceDetails(placeId: string): Observable<Location> {
    return this.api.get<Location>(`maps/place/${placeId}`);
  }

  /**
   * Generate a Google Maps URL for viewing a location
   * @param location - Location object with coordinates
   * @returns URL string for Google Maps
   */
  getMapUrl(location: Location): string {
    if (
      !location ||
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number'
    ) {
      console.error('Invalid location provided to getMapUrl:', location);
      return '';
    }

    // Use Google Maps search API with coordinates for most accurate results
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }

  /**
   * Generate a Google Maps URL for directions between two locations
   * @param from - Starting location
   * @param to - Destination location
   * @returns URL string for Google Maps directions
   */
  getDirectionsUrl(from: Location, to: Location): string {
    if (!from || !to) {
      console.error('Invalid locations provided to getDirectionsUrl:', { from, to });
      return '';
    }

    if (
      typeof from.latitude !== 'number' ||
      typeof from.longitude !== 'number' ||
      typeof to.latitude !== 'number' ||
      typeof to.longitude !== 'number'
    ) {
      console.error('Invalid coordinates in locations:', { from, to });
      return '';
    }

    // Use coordinates for origin and destination for most accurate routing
    const origin = `${from.latitude},${from.longitude}`;
    const destination = `${to.latitude},${to.longitude}`;

    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
  }

  /**
   * Generate a static map image URL (for embedding)
   * Note: Requires Google Maps Static API key
   * @param location - Location to display
   * @param _zoom - Zoom level (1-20)
   * @param _width - Image width in pixels
   * @param _height - Image height in pixels
   * @returns URL string for static map image
   */
  getStaticMapUrl(
    location: Location,
    _zoom: number = 14,
    _width: number = 600,
    _height: number = 400,
  ): string {
    if (
      !location ||
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number'
    ) {
      console.error('Invalid location provided to getStaticMapUrl:', location);
      return '';
    }

    // Note: This would require a Google Maps Static API key in production
    // For now, returning the dynamic maps URL as a fallback
    return this.getMapUrl(location);
  }

  /**
   * Validate that a location has required geocoding data
   * @param location - Location object to validate
   * @returns True if location has valid coordinates
   */
  isLocationGeocoded(location: Location): boolean {
    return (
      location !== null &&
      location !== undefined &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      !isNaN(location.latitude) &&
      !isNaN(location.longitude) &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180
    );
  }

  /**
   * Get a shareable map link with a label
   * @param location - Location to share
   * @param label - Label/name for the location
   * @returns URL string for Google Maps with label
   */
  getShareableMapUrl(location: Location, label: string): string {
    if (!this.isLocationGeocoded(location)) {
      console.error('Invalid location provided to getShareableMapUrl:', location);
      return '';
    }

    const coords = `${location.latitude},${location.longitude}`;
    const encodedLabel = encodeURIComponent(label);

    return `https://www.google.com/maps/search/?api=1&query=${coords}&query_place_id=${location.placeId || ''}&label=${encodedLabel}`;
  }
}
