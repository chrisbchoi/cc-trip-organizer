import { TestBed } from '@angular/core/testing';
import { EnvironmentService } from './environment.service';
import { environment } from '../../../environments/environment';

describe('EnvironmentService', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnvironmentService],
    });
    service = TestBed.inject(EnvironmentService);
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Environment Property Access', () => {
    it('should return API URL from environment', () => {
      expect(service.apiUrl).toBe(environment.apiUrl);
    });

    it('should return app name from environment', () => {
      expect(service.appName).toBe(environment.appName);
    });

    it('should return version from environment', () => {
      expect(service.version).toBe(environment.version);
    });

    it('should return production flag from environment', () => {
      expect(service.isProduction).toBe(environment.production);
    });

    it('should return features from environment', () => {
      expect(service.features).toBe(environment.features);
    });
  });

  describe('getApiEndpoint', () => {
    it('should build full API endpoint URL', () => {
      const path = 'trips';
      const expectedUrl = `${environment.apiUrl}/${path}`;
      expect(service.getApiEndpoint(path)).toBe(expectedUrl);
    });

    it('should handle path with leading slash', () => {
      const path = '/trips/123';
      const expectedUrl = `${environment.apiUrl}/trips/123`;
      expect(service.getApiEndpoint(path)).toBe(expectedUrl);
    });

    it('should handle path without leading slash', () => {
      const path = 'itinerary/items';
      const expectedUrl = `${environment.apiUrl}/${path}`;
      expect(service.getApiEndpoint(path)).toBe(expectedUrl);
    });

    it('should handle empty path', () => {
      const path = '';
      const expectedUrl = `${environment.apiUrl}/`;
      expect(service.getApiEndpoint(path)).toBe(expectedUrl);
    });

    it('should handle nested paths', () => {
      const path = 'trips/123/itinerary/items/456';
      const expectedUrl = `${environment.apiUrl}/${path}`;
      expect(service.getApiEndpoint(path)).toBe(expectedUrl);
    });
  });
});
