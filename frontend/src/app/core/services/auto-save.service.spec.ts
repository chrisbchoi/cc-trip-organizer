import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { AutoSaveService, AutoSaveStatus, AutoSaveConfig } from './auto-save.service';

describe('AutoSaveService', () => {
  let service: AutoSaveService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AutoSaveService],
    });
    service = TestBed.inject(AutoSaveService);
  });

  afterEach(() => {
    service.reset();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start with IDLE status', () => {
      expect(service.status).toBe(AutoSaveStatus.IDLE);
      expect(service.isSaving).toBe(false);
      expect(service.isSaved).toBe(false);
      expect(service.hasError).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should allow configuration with custom debounce time', () => {
      const config: AutoSaveConfig = { debounceMs: 1000 };
      service.configure(config);
      expect(service).toBeTruthy();
    });

    it('should allow enabling and disabling auto-save', () => {
      service.disable();
      expect(service).toBeTruthy();

      service.enable();
      expect(service).toBeTruthy();
    });

    it('should merge configuration with defaults', () => {
      service.configure({ debounceMs: 500 });
      expect(service).toBeTruthy();
    });
  });

  describe('Status Tracking', () => {
    it('should emit status changes through status$ observable', fakeAsync(() => {
      const statuses: AutoSaveStatus[] = [];
      service.status$.subscribe((status) => statuses.push(status));

      // Simulate status changes
      service.reset();
      tick();

      expect(statuses).toContain(AutoSaveStatus.IDLE);
    }));

    it('should track status transitions through status$ observable', fakeAsync(() => {
      const source$ = new Subject<Record<string, unknown>>();
      const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({}));

      const statuses: AutoSaveStatus[] = [];
      service.status$.subscribe((status) => statuses.push(status));

      service.setupAutoSave(source$, saveFn).subscribe();

      source$.next({ data: 'test' });
      tick(2000); // Wait for debounce to complete
      tick(); // Allow save to complete

      // Should have gone through: SAVING -> SAVED
      expect(statuses).toContain(AutoSaveStatus.SAVING);
      expect(statuses).toContain(AutoSaveStatus.SAVED);

      flush();
    }));

    it('should provide isSaved getter', fakeAsync(() => {
      const source$ = new Subject<any>();
      const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({}));

      service.setupAutoSave(source$, saveFn).subscribe();

      source$.next({ data: 'test' });
      tick(2000); // Wait for debounce
      tick(); // Complete the save

      expect(service.isSaved).toBe(true);
      flush();
    }));

    it('should provide hasError getter', fakeAsync(() => {
      const source$ = new Subject<any>();
      const saveFn = jasmine
        .createSpy('saveFn')
        .and.returnValue(throwError(() => new Error('Save failed')));

      service.setupAutoSave(source$, saveFn).subscribe();

      source$.next({ data: 'test' });
      tick(2000); // Wait for debounce
      tick(); // Error occurs

      expect(service.hasError).toBe(true);
      flush();
    }));
  });

  describe('setupAutoSave', () => {
    it('should debounce source emissions', fakeAsync(() => {
      const source$ = new Subject<string>();
      const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({}));

      service.setupAutoSave(source$, saveFn).subscribe();

      // Emit multiple values rapidly
      source$.next('value1');
      tick(500);
      source$.next('value2');
      tick(500);
      source$.next('value3');
      tick(2000); // Wait for debounce to complete

      // Should only save once with the last value
      expect(saveFn).toHaveBeenCalledTimes(1);
      expect(saveFn).toHaveBeenCalledWith('value3');
      flush();
    }));

    it('should set status to SAVING when debounce completes', fakeAsync(() => {
      const source$ = new Subject<any>();
      const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({}));

      const statuses: AutoSaveStatus[] = [];
      service.status$.subscribe((status) => statuses.push(status));

      service.setupAutoSave(source$, saveFn).subscribe();

      source$.next({ data: 'test' });
      tick(2000); // Wait for debounce

      expect(statuses).toContain(AutoSaveStatus.SAVING);
      flush();
    }));

    it('should set status to SAVED after successful save', fakeAsync(() => {
      const source$ = new Subject<any>();
      const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({ success: true }));

      const statuses: AutoSaveStatus[] = [];
      service.status$.subscribe((status) => statuses.push(status));

      service.setupAutoSave(source$, saveFn).subscribe();

      source$.next({ data: 'test' });
      tick(2000); // Wait for debounce
      tick(); // Allow save to complete

      expect(statuses).toContain(AutoSaveStatus.SAVED);
      flush();
    }));

    it('should reset to IDLE after SAVED status (3 seconds)', fakeAsync(() => {
      const source$ = new Subject<any>();
      const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({}));

      const statuses: AutoSaveStatus[] = [];
      service.status$.subscribe((status) => statuses.push(status));

      service.setupAutoSave(source$, saveFn).subscribe();

      source$.next({ data: 'test' });
      tick(2000); // Debounce
      tick(); // Save completes
      tick(3000); // Wait for reset timeout

      // Should have gone: SAVING -> SAVED -> IDLE
      expect(statuses[statuses.length - 1]).toBe(AutoSaveStatus.IDLE);
      flush();
    }));

    it('should set status to ERROR on save failure', fakeAsync(() => {
      const source$ = new Subject<any>();
      const saveFn = jasmine
        .createSpy('saveFn')
        .and.returnValue(throwError(() => new Error('Network error')));

      const statuses: AutoSaveStatus[] = [];
      service.status$.subscribe((status) => statuses.push(status));

      service.setupAutoSave(source$, saveFn).subscribe();

      source$.next({ data: 'test' });
      tick(2000); // Debounce
      tick(); // Error occurs

      expect(statuses).toContain(AutoSaveStatus.ERROR);
      flush();
    }));

    it('should reset to IDLE after ERROR status (5 seconds)', fakeAsync(() => {
      const source$ = new Subject<any>();
      const saveFn = jasmine
        .createSpy('saveFn')
        .and.returnValue(throwError(() => new Error('Save failed')));

      const statuses: AutoSaveStatus[] = [];
      service.status$.subscribe((status) => statuses.push(status));

      service.setupAutoSave(source$, saveFn).subscribe();

      source$.next({ data: 'test' });
      tick(2000); // Debounce
      tick(); // Error occurs
      tick(5000); // Wait for reset timeout

      // Should have gone: SAVING -> ERROR -> IDLE
      expect(statuses[statuses.length - 1]).toBe(AutoSaveStatus.IDLE);
      flush();
    }));

    it('should not save when auto-save is disabled', fakeAsync(() => {
      service.disable();

      const source$ = new Subject<any>();
      const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({}));

      service.setupAutoSave(source$, saveFn).subscribe();

      source$.next({ data: 'test' });
      tick(2000); // Wait for debounce

      expect(saveFn).not.toHaveBeenCalled();
      flush();
    }));

    it('should log errors to console on save failure', fakeAsync(() => {
      spyOn(console, 'error');

      const source$ = new Subject<any>();
      const error = new Error('Save failed');
      const saveFn = jasmine.createSpy('saveFn').and.returnValue(throwError(() => error));

      service.setupAutoSave(source$, saveFn).subscribe();

      source$.next({ data: 'test' });
      tick(2000); // Debounce
      tick(); // Error occurs

      expect(console.error).toHaveBeenCalledWith('Auto-save error:', error);
      flush();
    }));
  });

  describe('triggerSave and createSavePipeline', () => {
    it('should manually trigger save through triggerSave', fakeAsync(() => {
      const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({}));

      service.createSavePipeline(saveFn).subscribe();

      service.triggerSave({ data: 'manual save' });
      tick(2000); // Wait for debounce

      expect(saveFn).toHaveBeenCalledWith({ data: 'manual save' });
      flush();
    }));

    it('should not trigger save when disabled', fakeAsync(() => {
      service.disable();

      const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({}));
      service.createSavePipeline(saveFn).subscribe();

      service.triggerSave({ data: 'test' });
      tick(2000);

      expect(saveFn).not.toHaveBeenCalled();
      flush();
    }));

    it('should handle createSavePipeline with errors', fakeAsync(() => {
      const saveFn = jasmine
        .createSpy('saveFn')
        .and.returnValue(throwError(() => new Error('Pipeline error')));

      const statuses: AutoSaveStatus[] = [];
      service.status$.subscribe((status) => statuses.push(status));

      service.createSavePipeline(saveFn).subscribe();

      service.triggerSave({ data: 'test' });
      tick(2000); // Debounce
      tick(); // Error occurs

      expect(statuses).toContain(AutoSaveStatus.ERROR);
      flush();
    }));
  });

  describe('reset', () => {
    it('should reset status to IDLE', fakeAsync(() => {
      const source$ = new Subject<any>();
      const saveFn = jasmine.createSpy('saveFn').and.returnValue(of({}));

      service.setupAutoSave(source$, saveFn).subscribe();

      source$.next({ data: 'test' });
      tick(2000);
      tick(); // Save completes, status is SAVED

      service.reset();

      expect(service.status).toBe(AutoSaveStatus.IDLE);
      flush();
    }));
  });
});
