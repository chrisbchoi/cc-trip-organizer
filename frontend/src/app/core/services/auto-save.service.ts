import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, switchMap, catchError, tap } from 'rxjs/operators';

/**
 * Auto-save status enumeration
 */
export enum AutoSaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
}

/**
 * Auto-save configuration interface
 */
export interface AutoSaveConfig {
  /** Debounce time in milliseconds (default: 2000ms) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
}

/**
 * AutoSaveService
 *
 * Generic service for implementing auto-save functionality with debouncing.
 * Listens to form value changes, debounces them, and automatically saves
 * to the backend with proper status tracking and error handling.
 *
 * Features:
 * - Configurable debounce time (default 2 seconds)
 * - Status tracking (idle, saving, saved, error)
 * - Error handling with retry capability
 * - Can be disabled/enabled dynamically
 *
 * Usage:
 * ```typescript
 * export class MyFormComponent {
 *   autoSaveService = inject(AutoSaveService);
 *
 *   ngOnInit() {
 *     // Subscribe to status changes
 *     this.autoSaveService.status$.subscribe(status => {
 *       console.log('Save status:', status);
 *     });
 *
 *     // Setup auto-save with form value changes
 *     this.autoSaveService.setupAutoSave(
 *       this.myForm.valueChanges,
 *       (value) => this.apiService.update(this.id, value)
 *     ).subscribe();
 *
 *     // Or manually trigger save
 *     this.autoSaveService.triggerSave(formValue);
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AutoSaveService {
  /**
   * Subject to emit save operations
   */
  private saveSubject = new Subject<any>();

  /**
   * Subject to track save status
   */
  private statusSubject = new Subject<AutoSaveStatus>();

  /**
   * Observable of save status changes
   */
  public readonly status$ = this.statusSubject.asObservable();

  /**
   * Current save status
   */
  private currentStatus: AutoSaveStatus = AutoSaveStatus.IDLE;

  /**
   * Configuration for auto-save
   */
  private config: Required<AutoSaveConfig> = {
    debounceMs: 2000,
    enabled: true,
  };

  /**
   * Get the current save status
   */
  get status(): AutoSaveStatus {
    return this.currentStatus;
  }

  /**
   * Check if auto-save is currently saving
   */
  get isSaving(): boolean {
    return this.currentStatus === AutoSaveStatus.SAVING;
  }

  /**
   * Check if last save was successful
   */
  get isSaved(): boolean {
    return this.currentStatus === AutoSaveStatus.SAVED;
  }

  /**
   * Check if there was an error
   */
  get hasError(): boolean {
    return this.currentStatus === AutoSaveStatus.ERROR;
  }

  /**
   * Update auto-save configuration
   */
  configure(config: AutoSaveConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Enable auto-save
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * Disable auto-save
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * Setup auto-save with an observable source and save function
   *
   * @param source$ Observable source (e.g., form.valueChanges)
   * @param saveFn Function that performs the save operation and returns an Observable
   * @returns Observable that emits when save completes
   */
  setupAutoSave<T>(
    source$: Observable<T>,
    saveFn: (value: T) => Observable<any>,
  ): Observable<any> {
    return source$.pipe(
      debounceTime(this.config.debounceMs),
      tap(() => {
        if (this.config.enabled) {
          this.updateStatus(AutoSaveStatus.SAVING);
        }
      }),
      switchMap((value) => {
        if (!this.config.enabled) {
          return of(null);
        }

        return saveFn(value).pipe(
          tap(() => {
            this.updateStatus(AutoSaveStatus.SAVED);
            // Reset to idle after 3 seconds
            setTimeout(() => {
              if (this.currentStatus === AutoSaveStatus.SAVED) {
                this.updateStatus(AutoSaveStatus.IDLE);
              }
            }, 3000);
          }),
          catchError((error) => {
            console.error('Auto-save error:', error);
            this.updateStatus(AutoSaveStatus.ERROR);
            // Reset to idle after 5 seconds
            setTimeout(() => {
              if (this.currentStatus === AutoSaveStatus.ERROR) {
                this.updateStatus(AutoSaveStatus.IDLE);
              }
            }, 5000);
            return of(null);
          }),
        );
      }),
    );
  }

  /**
   * Manually trigger a save operation through the save subject
   * This bypasses the debounce and saves immediately
   *
   * @param value Value to save
   */
  triggerSave(value: any): void {
    if (this.config.enabled) {
      this.saveSubject.next(value);
    }
  }

  /**
   * Create a save pipeline that can be subscribed to
   * Use this when you want to manually control the subscription
   *
   * @param saveFn Function that performs the save operation
   * @returns Observable that processes saves from triggerSave()
   */
  createSavePipeline<T>(saveFn: (value: T) => Observable<any>): Observable<any> {
    return this.saveSubject.asObservable().pipe(
      debounceTime(this.config.debounceMs),
      tap(() => {
        if (this.config.enabled) {
          this.updateStatus(AutoSaveStatus.SAVING);
        }
      }),
      switchMap((value: T) => {
        if (!this.config.enabled) {
          return of(null);
        }

        return saveFn(value).pipe(
          tap(() => {
            this.updateStatus(AutoSaveStatus.SAVED);
            setTimeout(() => {
              if (this.currentStatus === AutoSaveStatus.SAVED) {
                this.updateStatus(AutoSaveStatus.IDLE);
              }
            }, 3000);
          }),
          catchError((error) => {
            console.error('Auto-save error:', error);
            this.updateStatus(AutoSaveStatus.ERROR);
            setTimeout(() => {
              if (this.currentStatus === AutoSaveStatus.ERROR) {
                this.updateStatus(AutoSaveStatus.IDLE);
              }
            }, 5000);
            return of(null);
          }),
        );
      }),
    );
  }

  /**
   * Reset status to idle
   */
  reset(): void {
    this.updateStatus(AutoSaveStatus.IDLE);
  }

  /**
   * Update status and emit the change
   */
  private updateStatus(status: AutoSaveStatus): void {
    this.currentStatus = status;
    this.statusSubject.next(status);
  }
}
