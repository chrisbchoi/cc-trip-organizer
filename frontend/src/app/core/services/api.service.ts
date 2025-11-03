import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  observe?: 'body';
  responseType?: 'json';
}

/**
 * Base API service for making HTTP requests to the backend
 * Provides generic methods with type safety and centralized error handling
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly envService = inject(EnvironmentService);

  /**
   * Perform a GET request
   * @param endpoint - API endpoint path (e.g., 'trips' or '/trips')
   * @param options - Optional HTTP request options
   * @returns Observable of the typed response
   */
  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.get<T>(url, options).pipe(catchError(this.handleError));
  }

  /**
   * Perform a POST request
   * @param endpoint - API endpoint path
   * @param body - Request body data
   * @param options - Optional HTTP request options
   * @returns Observable of the typed response
   */
  post<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.post<T>(url, body, options).pipe(catchError(this.handleError));
  }

  /**
   * Perform a PUT request
   * @param endpoint - API endpoint path
   * @param body - Request body data
   * @param options - Optional HTTP request options
   * @returns Observable of the typed response
   */
  put<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.put<T>(url, body, options).pipe(catchError(this.handleError));
  }

  /**
   * Perform a PATCH request
   * @param endpoint - API endpoint path
   * @param body - Request body data
   * @param options - Optional HTTP request options
   * @returns Observable of the typed response
   */
  patch<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.patch<T>(url, body, options).pipe(catchError(this.handleError));
  }

  /**
   * Perform a DELETE request
   * @param endpoint - API endpoint path
   * @param options - Optional HTTP request options
   * @returns Observable of the typed response
   */
  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.delete<T>(url, options).pipe(catchError(this.handleError));
  }

  /**
   * Build full URL from endpoint path
   * @param endpoint - API endpoint path
   * @returns Full URL with base API URL prepended
   */
  private buildUrl(endpoint: string): string {
    return this.envService.getApiEndpoint(endpoint);
  }

  /**
   * Centralized error handling
   * @param error - HTTP error response
   * @returns Observable error with formatted message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Server error: ${error.status} ${error.statusText}`;
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
