import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Trip } from '../../../core/models/trip.model';
import { ApiService } from '../../../core/services/api.service';

interface TripResponse {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface TripExportData {
  trip: TripResponse;
  itineraryItems: unknown[];
  exportedAt: string;
  version: string;
}

/**
 * Service for making API calls related to trips
 * Uses the base ApiService for HTTP operations
 */
@Injectable({
  providedIn: 'root',
})
export class TripsApiService {
  private api = inject(ApiService);

  /**
   * Get all trips
   * @returns Observable of Trip array
   */
  getTrips(): Observable<Trip[]> {
    return this.api
      .get<TripResponse[]>('trips')
      .pipe(map((trips) => trips.map((trip) => new Trip(trip as unknown as Partial<Trip>))));
  }

  /**
   * Get a single trip by ID
   * @param id Trip ID
   * @returns Observable of Trip
   */
  getTrip(id: string): Observable<Trip> {
    return this.api
      .get<TripResponse>(`trips/${id}`)
      .pipe(map((trip) => new Trip(trip as unknown as Partial<Trip>)));
  }

  /**
   * Create a new trip
   * @param trip Partial trip data
   * @returns Observable of created Trip
   */
  createTrip(trip: Partial<Trip>): Observable<Trip> {
    return this.api
      .post<TripResponse>('trips', trip)
      .pipe(map((createdTrip) => new Trip(createdTrip as unknown as Partial<Trip>)));
  }

  /**
   * Update an existing trip
   * @param id Trip ID
   * @param trip Partial trip data to update
   * @returns Observable of updated Trip
   */
  updateTrip(id: string, trip: Partial<Trip>): Observable<Trip> {
    return this.api
      .put<TripResponse>(`trips/${id}`, trip)
      .pipe(map((updatedTrip) => new Trip(updatedTrip as unknown as Partial<Trip>)));
  }

  /**
   * Delete a trip
   * @param id Trip ID
   * @returns Observable of void
   */
  deleteTrip(id: string): Observable<void> {
    return this.api.delete<void>(`trips/${id}`);
  }

  /**
   * Export trip as JSON
   * @param id Trip ID
   * @returns Observable of export data
   */
  exportTripToJson(id: string): Observable<TripExportData> {
    return this.api.get<TripExportData>(`trips/${id}/export/json`);
  }
}
