import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * HTTP Interceptor for API requests
 * - Adds common headers (Content-Type, Accept)
 * - Manages global loading state
 * - Handles global error responses
 * - Logs requests in development mode
 * - Can be extended for authentication tokens
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Start loading indicator
  loadingService.startLoading();

  // Clone the request and add default headers
  const apiReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Log request in development mode
  if (!isProduction()) {
    console.log('API Request:', {
      method: apiReq.method,
      url: apiReq.url,
      headers: apiReq.headers,
      body: apiReq.body,
    });
  }

  const startTime = Date.now();

  // Pass the cloned request to the next handler
  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log error in development mode
      if (!isProduction()) {
        console.error('API Error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
        });
      }

      // Handle specific error codes globally
      if (error.status === 401) {
        console.error('Unauthorized access - authentication required');
        // Future: Redirect to login or refresh token
      } else if (error.status === 403) {
        console.error('Forbidden - insufficient permissions');
      } else if (error.status === 404) {
        console.error('Resource not found');
      } else if (error.status >= 500) {
        console.error('Server error - please try again later');
      }

      return throwError(() => error);
    }),
    finalize(() => {
      // Stop loading indicator when request completes
      loadingService.stopLoading();

      // Log request completion time in development
      if (!isProduction()) {
        const duration = Date.now() - startTime;
        console.log(`API Request completed in ${duration}ms:`, apiReq.url);
      }
    }),
  );
};

/**
 * Helper function to check if running in production mode
 */
function isProduction(): boolean {
  // Access environment through a try-catch in case it's not available
  try {
    return (window as any)['environment']?.production ?? false;
  } catch {
    return false;
  }
}
