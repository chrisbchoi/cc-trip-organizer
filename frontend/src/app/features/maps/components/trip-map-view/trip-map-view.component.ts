import { Component, Input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryItemBase } from '../../../../core/models/itinerary-item.model';
import { Flight } from '../../../../core/models/flight.model';
import { Transport } from '../../../../core/models/transport.model';
import { Accommodation } from '../../../../core/models/accommodation.model';
import { Location } from '../../../../core/models/location.model';
import { MapsService } from '../../services/maps.service';

/**
 * Interface for map markers with location and label
 */
interface MapMarker {
  location: Location;
  label: string;
  index: number;
  itemType: 'flight' | 'transport' | 'accommodation';
}

/**
 * Component to display all trip locations on a map view
 * Shows a Google Maps embed with numbered markers for each location
 */
@Component({
  selector: 'app-trip-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-map-view.component.html',
  styleUrl: './trip-map-view.component.scss',
})
export class TripMapViewComponent {
  private mapsService = inject(MapsService);

  /**
   * Array of itinerary items to display on map
   */
  @Input() set items(value: ItineraryItemBase[] | null) {
    this._items.set(value || []);
  }

  private _items = signal<ItineraryItemBase[]>([]);

  /**
   * Extract all valid locations from itinerary items
   */
  markers = computed(() => {
    const items = this._items();
    const markers: MapMarker[] = [];
    let markerIndex = 1;

    items.forEach((item) => {
      // Extract locations based on item type
      if (item.type === 'flight') {
        const flight = item as Flight;

        if (this.isValidLocation(flight.departureLocation)) {
          markers.push({
            location: flight.departureLocation,
            label: `${markerIndex}. ${flight.departureLocation.city || flight.departureLocation.address} (Departure)`,
            index: markerIndex++,
            itemType: 'flight',
          });
        }

        if (this.isValidLocation(flight.arrivalLocation)) {
          markers.push({
            location: flight.arrivalLocation,
            label: `${markerIndex}. ${flight.arrivalLocation.city || flight.arrivalLocation.address} (Arrival)`,
            index: markerIndex++,
            itemType: 'flight',
          });
        }
      } else if (item.type === 'transport') {
        const transport = item as Transport;

        if (this.isValidLocation(transport.departureLocation)) {
          markers.push({
            location: transport.departureLocation,
            label: `${markerIndex}. ${transport.departureLocation.city || transport.departureLocation.address} (From)`,
            index: markerIndex++,
            itemType: 'transport',
          });
        }

        if (this.isValidLocation(transport.arrivalLocation)) {
          markers.push({
            location: transport.arrivalLocation,
            label: `${markerIndex}. ${transport.arrivalLocation.city || transport.arrivalLocation.address} (To)`,
            index: markerIndex++,
            itemType: 'transport',
          });
        }
      } else if (item.type === 'accommodation') {
        const accommodation = item as Accommodation;

        if (this.isValidLocation(accommodation.location)) {
          markers.push({
            location: accommodation.location,
            label: `${markerIndex}. ${accommodation.name}`,
            index: markerIndex++,
            itemType: 'accommodation',
          });
        }
      }
    });

    return markers;
  });

  /**
   * Check if there are any valid locations to display
   */
  hasLocations = computed(() => this.markers().length > 0);

  /**
   * Generate Google Maps embed URL with all markers
   */
  mapEmbedUrl = computed(() => {
    const markers = this.markers();

    if (markers.length === 0) {
      return '';
    }

    // If only one location, center on it
    if (markers.length === 1) {
      const marker = markers[0];
      return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${marker.location.latitude},${marker.location.longitude}&zoom=12`;
    }

    // For multiple locations, build a URL with all markers
    // Using Google Maps Embed API with multiple locations

    // Calculate center point (average of all coordinates)
    const centerLat = markers.reduce((sum, m) => sum + m.location.latitude, 0) / markers.length;
    const centerLng = markers.reduce((sum, m) => sum + m.location.longitude, 0) / markers.length;

    // For multiple markers, we'll use a static map approach or directions API
    // Since Google Maps Embed API doesn't directly support multiple custom markers,
    // we'll generate a URL that can be used with an iframe pointing to a regular Google Maps view
    return `https://www.google.com/maps?q=${centerLat},${centerLng}&t=m&z=8&output=embed`;
  });

  /**
   * Generate a URL to view all locations in Google Maps (opens in new tab)
   */
  getFullMapUrl(): string {
    const markers = this.markers();

    if (markers.length === 0) {
      return '';
    }

    if (markers.length === 1) {
      return this.mapsService.getMapUrl(markers[0].location);
    }

    // Build a Google Maps URL with waypoints
    // Format: https://www.google.com/maps/dir/location1/location2/location3
    const locations = markers
      .map((m) => `${m.location.latitude},${m.location.longitude}`)
      .join('/');

    return `https://www.google.com/maps/dir/${locations}`;
  }

  /**
   * Open map in new tab with all locations
   */
  openInGoogleMaps(): void {
    const url = this.getFullMapUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Get map URL for a specific marker
   */
  getMarkerMapUrl(marker: MapMarker): string {
    return this.mapsService.getMapUrl(marker.location);
  }

  /**
   * Open specific location in Google Maps
   */
  openMarkerInMap(marker: MapMarker): void {
    const url = this.getMarkerMapUrl(marker);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Validate that a location has valid coordinates
   */
  private isValidLocation(location: Location | undefined): boolean {
    return this.mapsService.isLocationGeocoded(location as Location);
  }

  /**
   * Get icon class based on item type
   */
  getMarkerIcon(type: 'flight' | 'transport' | 'accommodation'): string {
    switch (type) {
      case 'flight':
        return '✈️';
      case 'transport':
        return '🚗';
      case 'accommodation':
        return '🏨';
      default:
        return '📍';
    }
  }

  /**
   * Get color class for marker based on type
   */
  getMarkerColorClass(type: 'flight' | 'transport' | 'accommodation'): string {
    switch (type) {
      case 'flight':
        return 'marker-flight';
      case 'transport':
        return 'marker-transport';
      case 'accommodation':
        return 'marker-accommodation';
      default:
        return 'marker-default';
    }
  }
}
