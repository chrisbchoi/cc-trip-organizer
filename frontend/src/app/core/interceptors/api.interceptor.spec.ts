import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './api.interceptor';
import { LoadingService } from '../services/loading.service';

describe('apiInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;

  const testUrl = 'http://localhost:3000/api/test';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        LoadingService,
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);

    // Reset loading service before each test
    loadingService.reset();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Loading State Management', () => {
    it('should call loadingService.startLoading when request starts', (done) => {
      spyOn(loadingService, 'startLoading').and.callThrough();

      httpClient.get(testUrl).subscribe({
        complete: () => {
          expect(loadingService.startLoading).toHaveBeenCalled();
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({ data: 'test' });
    });

    it('should call loadingService.stopLoading when request completes', (done) => {
      spyOn(loadingService, 'stopLoading').and.callThrough();

      httpClient.get(testUrl).subscribe({
        complete: () => {
          // finalize runs after complete, use setTimeout to let it finish
          setTimeout(() => {
            expect(loadingService.stopLoading).toHaveBeenCalled();
            done();
          }, 0);
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({ data: 'test' });
    });

    it('should call stopLoading even when request fails', (done) => {
      spyOn(loadingService, 'stopLoading').and.callThrough();

      httpClient.get(testUrl).subscribe({
        next: () => done.fail('Should have failed'),
        error: () => {
          // finalize runs after error, use setTimeout to let it finish
          setTimeout(() => {
            expect(loadingService.stopLoading).toHaveBeenCalled();
            done();
          }, 0);
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
    });

    it('should manage loading state for multiple concurrent requests', (done) => {
      const requests = 3;
      let completed = 0;

      const checkDone = () => {
        completed++;
        if (completed === requests) {
          // Use setTimeout to ensure finalize has run for all requests
          setTimeout(() => {
            expect(loadingService.getActiveRequestCount()).toBe(0);
            expect(loadingService.isLoading()).toBe(false);
            done();
          }, 10);
        }
      };

      for (let i = 0; i < requests; i++) {
        httpClient.get(`${testUrl}/${i}`).subscribe({
          next: checkDone,
          error: done.fail,
        });
      }

      // All requests should be tracked
      expect(loadingService.getActiveRequestCount()).toBe(requests);
      expect(loadingService.isLoading()).toBe(true);

      // Flush all requests
      for (let i = 0; i < requests; i++) {
        const req = httpMock.expectOne(`${testUrl}/${i}`);
        req.flush({ data: i });
      }
    });
  });

  describe('Request Header Modification', () => {
    it('should add Content-Type header to requests', (done) => {
      httpClient.get(testUrl).subscribe({
        next: () => done(),
        error: done.fail,
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({});
    });

    it('should add Accept header to requests', (done) => {
      httpClient.get(testUrl).subscribe({
        next: () => done(),
        error: done.fail,
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Accept')).toBe('application/json');
      req.flush({});
    });

    it('should preserve existing headers', (done) => {
      const customHeaders = { Authorization: 'Bearer token123' };

      httpClient.get(testUrl, { headers: customHeaders }).subscribe({
        next: () => done(),
        error: done.fail,
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({});
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized errors', (done) => {
      spyOn(console, 'error');

      httpClient.get(testUrl).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(console.error).toHaveBeenCalledWith(
            'Unauthorized access - authentication required',
          );
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 Forbidden errors', (done) => {
      spyOn(console, 'error');

      httpClient.get(testUrl).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
          expect(console.error).toHaveBeenCalledWith('Forbidden - insufficient permissions');
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle 404 Not Found errors', (done) => {
      spyOn(console, 'error');

      httpClient.get(testUrl).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(console.error).toHaveBeenCalledWith('Resource not found');
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 Server errors', (done) => {
      spyOn(console, 'error');

      httpClient.get(testUrl).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(console.error).toHaveBeenCalledWith('Server error - please try again later');
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle 503 Service Unavailable errors', (done) => {
      spyOn(console, 'error');

      httpClient.get(testUrl).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(503);
          expect(console.error).toHaveBeenCalledWith('Server error - please try again later');
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 503, statusText: 'Service Unavailable' });
    });

    it('should propagate error through throwError', (done) => {
      httpClient.get(testUrl).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('Development Mode Logging', () => {
    beforeEach(() => {
      // Mock window.environment for testing
      (window as typeof window & { environment?: { production: boolean } }).environment = {
        production: false,
      };
    });

    afterEach(() => {
      // Clean up
      delete (window as typeof window & { environment?: { production: boolean } }).environment;
    });

    it('should log requests in development mode', (done) => {
      spyOn(console, 'log');

      httpClient.get(testUrl).subscribe({
        next: () => {
          expect(console.log).toHaveBeenCalledWith(
            'API Request:',
            jasmine.objectContaining({
              method: 'GET',
              url: testUrl,
            }),
          );
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({});
    });

    it('should log request completion time in development mode', (done) => {
      spyOn(console, 'log');

      httpClient.get(testUrl).subscribe({
        complete: () => {
          // finalize runs after complete, use setTimeout to let it finish
          setTimeout(() => {
            const calls = (console.log as jasmine.Spy).calls.all();
            const completionLog = calls.find((call) =>
              call.args[0]?.toString().includes('completed'),
            );
            expect(completionLog).toBeDefined();
            done();
          }, 10);
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({});
    });

    it('should log errors in development mode', (done) => {
      spyOn(console, 'error');

      httpClient.get(testUrl).subscribe({
        next: () => done.fail('Should have failed'),
        error: () => {
          expect(console.error).toHaveBeenCalledWith(
            'API Error:',
            jasmine.objectContaining({
              status: 500,
              url: testUrl,
            }),
          );
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      // Mock window.environment as production
      (window as typeof window & { environment?: { production: boolean } }).environment = {
        production: true,
      };
    });

    afterEach(() => {
      delete (window as typeof window & { environment?: { production: boolean } }).environment;
    });

    it('should not log requests in production mode', (done) => {
      spyOn(console, 'log');

      httpClient.get(testUrl).subscribe({
        next: () => {
          const apiRequestLogs = (console.log as jasmine.Spy).calls
            .all()
            .filter((call) => call.args[0] === 'API Request:');
          expect(apiRequestLogs.length).toBe(0);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({});
    });
  });

  describe('Request Timing', () => {
    it('should measure request duration', (done) => {
      const startTime = Date.now();

      httpClient.get(testUrl).subscribe({
        next: () => {
          const duration = Date.now() - startTime;
          expect(duration).toBeGreaterThanOrEqual(0);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(testUrl);
      setTimeout(() => {
        req.flush({});
      }, 50); // Simulate network delay
    });
  });
});
