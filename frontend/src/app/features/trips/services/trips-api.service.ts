import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Trip } from '../../../core/models/trip.model';
import { environment } from '../../../../environments/environment';

interface TripResponse {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for making API calls related to trips
 */
@Injectable({
  providedIn: 'root',
})
export class TripsApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/trips`;

  /**
   * Get all trips
   * @returns Observable of Trip array
   */
  getTrips(): Observable<Trip[]> {
    return this.http
      .get<TripResponse[]>(this.apiUrl)
      .pipe(map((trips) => trips.map((trip) => new Trip(trip as unknown as Partial<Trip>))));
  }

  /**
   * Get a single trip by ID
   * @param id Trip ID
   * @returns Observable of Trip
   */
  getTrip(id: string): Observable<Trip> {
    return this.http
      .get<TripResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((trip) => new Trip(trip as unknown as Partial<Trip>)));
  }

  /**
   * Create a new trip
   * @param trip Partial trip data
   * @returns Observable of created Trip
   */
  createTrip(trip: Partial<Trip>): Observable<Trip> {
    return this.http
      .post<TripResponse>(this.apiUrl, trip)
      .pipe(map((createdTrip) => new Trip(createdTrip as unknown as Partial<Trip>)));
  }

  /**
   * Update an existing trip
   * @param id Trip ID
   * @param trip Partial trip data to update
   * @returns Observable of updated Trip
   */
  updateTrip(id: string, trip: Partial<Trip>): Observable<Trip> {
    return this.http
      .put<TripResponse>(`${this.apiUrl}/${id}`, trip)
      .pipe(map((updatedTrip) => new Trip(updatedTrip as unknown as Partial<Trip>)));
  }

  /**
   * Delete a trip
   * @param id Trip ID
   * @returns Observable of void
   */
  deleteTrip(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
