import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Flight } from '../../../core/models/flight.model';
import { Transport } from '../../../core/models/transport.model';
import { Accommodation } from '../../../core/models/accommodation.model';
import { ApiService } from '../../../core/services/api.service';

/**
 * Union type for all itinerary item types
 */
export type ItineraryItem = Flight | Transport | Accommodation;

/**
 * Response interface for itinerary item from API
 */
interface ItineraryItemResponse {
  type: 'flight' | 'transport' | 'accommodation';
  [key: string]: unknown;
}

/**
 * Response interface for itinerary gaps
 */
export interface ItineraryGap {
  startDateTime: string;
  endDateTime: string;
  durationHours: number;
  previousItem?: unknown;
  nextItem?: unknown;
  suggestion?: 'transport' | 'accommodation';
}

/**
 * Service for making API calls related to itinerary items
 * Uses the base ApiService for HTTP operations
 */
@Injectable({
  providedIn: 'root',
})
export class ItineraryApiService {
  private api = inject(ApiService);

  /**
   * Get all itinerary items for a trip
   * @param tripId Trip ID
   * @returns Observable of ItineraryItem array
   */
  getItems(tripId: string): Observable<ItineraryItem[]> {
    return this.api
      .get<ItineraryItemResponse[]>(`trips/${tripId}/itinerary`)
      .pipe(map((items) => items.map((item) => this.mapToItineraryItem(item))));
  }

  /**
   * Get a single itinerary item by ID
   * @param id Item ID
   * @returns Observable of ItineraryItem
   */
  getItem(id: string): Observable<ItineraryItem> {
    return this.api
      .get<ItineraryItemResponse>(`itinerary/${id}`)
      .pipe(map((item) => this.mapToItineraryItem(item)));
  }

  /**
   * Create a new flight
   * @param tripId Trip ID
   * @param flight Partial flight data
   * @returns Observable of created Flight
   */
  createFlight(tripId: string, flight: Partial<Flight>): Observable<Flight> {
    return this.api
      .post<ItineraryItemResponse>(`trips/${tripId}/itinerary/flight`, flight)
      .pipe(map((item) => new Flight(item as unknown as Partial<Flight>)));
  }

  /**
   * Create a new transport
   * @param tripId Trip ID
   * @param transport Partial transport data
   * @returns Observable of created Transport
   */
  createTransport(tripId: string, transport: Partial<Transport>): Observable<Transport> {
    return this.api
      .post<ItineraryItemResponse>(`trips/${tripId}/itinerary/transport`, transport)
      .pipe(map((item) => new Transport(item as unknown as Partial<Transport>)));
  }

  /**
   * Create a new accommodation
   * @param tripId Trip ID
   * @param accommodation Partial accommodation data
   * @returns Observable of created Accommodation
   */
  createAccommodation(
    tripId: string,
    accommodation: Partial<Accommodation>,
  ): Observable<Accommodation> {
    return this.api
      .post<ItineraryItemResponse>(`trips/${tripId}/itinerary/accommodation`, accommodation)
      .pipe(map((item) => new Accommodation(item as unknown as Partial<Accommodation>)));
  }

  /**
   * Update an existing itinerary item
   * @param id Item ID
   * @param updates Partial item data to update
   * @returns Observable of updated ItineraryItem
   */
  updateItem(id: string, updates: Partial<ItineraryItem>): Observable<ItineraryItem> {
    return this.api
      .put<ItineraryItemResponse>(`itinerary/${id}`, updates)
      .pipe(map((item) => this.mapToItineraryItem(item)));
  }

  /**
   * Delete an itinerary item
   * @param id Item ID
   * @returns Observable of void
   */
  deleteItem(id: string): Observable<void> {
    return this.api.delete<void>(`itinerary/${id}`);
  }

  /**
   * Reorder an itinerary item (update its date/time)
   * @param id Item ID
   * @param newDate New start date
   * @returns Observable of updated ItineraryItem
   */
  reorderItem(id: string, newDate: Date): Observable<ItineraryItem> {
    return this.api
      .patch<ItineraryItemResponse>(`itinerary/${id}/reorder`, {
        startDate: newDate.toISOString(),
      })
      .pipe(map((item) => this.mapToItineraryItem(item)));
  }

  /**
   * Get gaps for a trip's itinerary
   * @param tripId Trip ID
   * @returns Observable of ItineraryGap array
   */
  getGaps(tripId: string): Observable<ItineraryGap[]> {
    return this.api.get<ItineraryGap[]>(`trips/${tripId}/gaps`);
  }

  /**
   * Map API response to appropriate ItineraryItem class
   * @param item Raw item data
   * @returns Typed ItineraryItem instance
   */
  private mapToItineraryItem(item: ItineraryItemResponse): ItineraryItem {
    switch (item.type) {
      case 'flight':
        // Merge the nested flight data with the base item data
        const flightData = { ...item, ...(item as any).flight };
        delete (flightData as any).flight; // Remove nested object
        return new Flight(flightData as unknown as Partial<Flight>);
      case 'transport':
        // Merge the nested transport data with the base item data
        const transportData = { ...item, ...(item as any).transport };
        delete (transportData as any).transport; // Remove nested object
        return new Transport(transportData as unknown as Partial<Transport>);
      case 'accommodation':
        // Merge the nested accommodation data with the base item data
        const accommodationData = { ...item, ...(item as any).accommodation };
        delete (accommodationData as any).accommodation; // Remove nested object
        return new Accommodation(accommodationData as unknown as Partial<Accommodation>);
      default:
        throw new Error(`Unknown itinerary item type: ${item.type}`);
    }
  }
}
