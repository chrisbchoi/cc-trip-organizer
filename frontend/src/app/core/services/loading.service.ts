import { Injectable, signal } from '@angular/core';

/**
 * Service to manage global loading state
 * Tracks active HTTP requests and provides a loading signal
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = signal(0);

  /**
   * Read-only signal indicating if any requests are in progress
   */
  readonly isLoading = signal(false);

  /**
   * Increment the count of active requests
   * Sets isLoading to true when first request starts
   */
  startLoading(): void {
    this.activeRequests.update((count) => count + 1);
    if (this.activeRequests() > 0) {
      this.isLoading.set(true);
    }
  }

  /**
   * Decrement the count of active requests
   * Sets isLoading to false when all requests complete
   */
  stopLoading(): void {
    this.activeRequests.update((count) => Math.max(0, count - 1));
    if (this.activeRequests() === 0) {
      this.isLoading.set(false);
    }
  }

  /**
   * Force reset loading state (useful for error recovery)
   */
  reset(): void {
    this.activeRequests.set(0);
    this.isLoading.set(false);
  }

  /**
   * Get the current number of active requests
   */
  getActiveRequestCount(): number {
    return this.activeRequests();
  }
}
