import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });
    service = TestBed.inject(LoadingService);
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start with isLoading as false', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should start with zero active requests', () => {
      expect(service.getActiveRequestCount()).toBe(0);
    });
  });

  describe('startLoading', () => {
    it('should increment active request count', () => {
      service.startLoading();
      expect(service.getActiveRequestCount()).toBe(1);
    });

    it('should set isLoading to true when first request starts', () => {
      service.startLoading();
      expect(service.isLoading()).toBe(true);
    });

    it('should handle multiple concurrent requests', () => {
      service.startLoading();
      service.startLoading();
      service.startLoading();

      expect(service.getActiveRequestCount()).toBe(3);
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('stopLoading', () => {
    it('should decrement active request count', () => {
      service.startLoading();
      service.startLoading();

      service.stopLoading();

      expect(service.getActiveRequestCount()).toBe(1);
      expect(service.isLoading()).toBe(true);
    });

    it('should set isLoading to false when all requests complete', () => {
      service.startLoading();
      service.stopLoading();

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should not go below zero active requests', () => {
      service.stopLoading();
      service.stopLoading();

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle multiple start/stop cycles', () => {
      service.startLoading();
      service.startLoading();
      service.startLoading();

      service.stopLoading();
      expect(service.getActiveRequestCount()).toBe(2);
      expect(service.isLoading()).toBe(true);

      service.stopLoading();
      expect(service.getActiveRequestCount()).toBe(1);
      expect(service.isLoading()).toBe(true);

      service.stopLoading();
      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all loading state', () => {
      service.startLoading();
      service.startLoading();
      service.startLoading();

      service.reset();

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle reset when no requests active', () => {
      service.reset();

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should be usable for error recovery', () => {
      // Simulate error scenario where requests get stuck
      service.startLoading();
      service.startLoading();

      // Force reset for error recovery
      service.reset();

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);

      // Should work normally after reset
      service.startLoading();
      expect(service.getActiveRequestCount()).toBe(1);
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('Signal Reactivity', () => {
    it('should update isLoading signal when state changes', () => {
      expect(service.isLoading()).toBe(false);

      service.startLoading();
      expect(service.isLoading()).toBe(true);

      service.stopLoading();
      expect(service.isLoading()).toBe(false);
    });

    it('should reflect active request count through signal', () => {
      expect(service.getActiveRequestCount()).toBe(0);

      service.startLoading();
      expect(service.getActiveRequestCount()).toBe(1);

      service.startLoading();
      expect(service.getActiveRequestCount()).toBe(2);

      service.stopLoading();
      expect(service.getActiveRequestCount()).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid start/stop operations', () => {
      for (let i = 0; i < 100; i++) {
        service.startLoading();
      }

      expect(service.getActiveRequestCount()).toBe(100);
      expect(service.isLoading()).toBe(true);

      for (let i = 0; i < 100; i++) {
        service.stopLoading();
      }

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle stop without start gracefully', () => {
      service.stopLoading();
      service.stopLoading();
      service.stopLoading();

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should maintain consistent state across multiple resets', () => {
      service.startLoading();
      service.reset();

      service.startLoading();
      service.startLoading();
      service.reset();

      service.startLoading();
      service.stopLoading();

      expect(service.getActiveRequestCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });
  });
});
