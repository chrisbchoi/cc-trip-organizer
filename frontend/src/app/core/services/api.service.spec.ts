import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService, ApiResponse, RequestOptions } from './api.service';
import { EnvironmentService } from './environment.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let envService: jasmine.SpyObj<EnvironmentService>;

  const mockApiUrl = 'http://localhost:3000/api';

  beforeEach(() => {
    const envServiceSpy = jasmine.createSpyObj('EnvironmentService', ['getApiEndpoint']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, { provide: EnvironmentService, useValue: envServiceSpy }],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    envService = TestBed.inject(EnvironmentService) as jasmine.SpyObj<EnvironmentService>;

    // Setup default mock behavior for envService
    envService.getApiEndpoint.and.callFake((path: string) => {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return `${mockApiUrl}/${cleanPath}`;
    });
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('GET requests', () => {
    it('should perform a GET request and return data', (done) => {
      const mockData = { id: '1', name: 'Test' };
      const endpoint = 'trips';

      service.get<typeof mockData>(endpoint).subscribe({
        next: (data) => {
          expect(data).toEqual(mockData);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle GET request with leading slash in endpoint', (done) => {
      const mockData = { id: '1' };

      service.get<typeof mockData>('/trips/1').subscribe({
        next: (data) => {
          expect(data).toEqual(mockData);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle GET request with query parameters', (done) => {
      const mockData = [{ id: '1' }, { id: '2' }];
      const options: RequestOptions = {
        params: { status: 'active' },
      };

      service.get<typeof mockData>('trips', options).subscribe({
        next: (data) => {
          expect(data).toEqual(mockData);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips?status=active`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle GET request errors', (done) => {
      const errorMessage = 'Trip not found';

      service.get('trips/999').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips/999`);
      req.flush({ message: errorMessage }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('POST requests', () => {
    it('should perform a POST request with body data', (done) => {
      const postData = { title: 'New Trip', startDate: '2026-01-01' };
      const mockResponse = { id: '1', ...postData };

      service.post<typeof mockResponse>('trips', postData).subscribe({
        next: (data) => {
          expect(data).toEqual(mockResponse);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(postData);
      req.flush(mockResponse);
    });

    it('should handle POST request errors', (done) => {
      const postData = { title: '' };
      const errorMessage = 'Validation failed';

      service.post('trips', postData).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips`);
      req.flush({ message: errorMessage }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('PUT requests', () => {
    it('should perform a PUT request to update data', (done) => {
      const updateData = { title: 'Updated Trip' };
      const mockResponse = { id: '1', ...updateData };

      service.put<typeof mockResponse>('trips/1', updateData).subscribe({
        next: (data) => {
          expect(data).toEqual(mockResponse);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });

    it('should handle PUT request errors', (done) => {
      const updateData = { title: 'Updated' };
      const errorMessage = 'Resource not found';

      service.put('trips/999', updateData).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips/999`);
      req.flush({ message: errorMessage }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('PATCH requests', () => {
    it('should perform a PATCH request for partial updates', (done) => {
      const patchData = { title: 'Patched Title' };
      const mockResponse = { id: '1', title: 'Patched Title', startDate: '2026-01-01' };

      service.patch<typeof mockResponse>('trips/1', patchData).subscribe({
        next: (data) => {
          expect(data).toEqual(mockResponse);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(patchData);
      req.flush(mockResponse);
    });
  });

  describe('DELETE requests', () => {
    it('should perform a DELETE request', (done) => {
      service.delete('trips/1').subscribe({
        next: () => {
          expect(true).toBe(true); // Request succeeded
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle DELETE request errors', (done) => {
      const errorMessage = 'Cannot delete trip';

      service.delete('trips/1').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips/1`);
      req.flush({ message: errorMessage }, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors (client-side)', (done) => {
      const errorEvent = new ErrorEvent('Network error', {
        message: 'Connection failed',
      });

      service.get('trips').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('Network error');
          done();
        },
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips`);
      req.error(errorEvent);
    });

    it('should handle backend errors with error.message', (done) => {
      const errorMessage = 'Server encountered an error';

      service.get('trips').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips`);
      req.flush({ message: errorMessage }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle backend errors without error.message', (done) => {
      service.get('trips').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          // Error message will include the HTTP status text
          expect(error.message).toContain('503');
          done();
        },
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips`);
      req.flush(null, { status: 503, statusText: 'Service Unavailable' });
    });

    it('should log errors to console', (done) => {
      spyOn(console, 'error');
      const errorMessage = 'Test error';

      service.get('trips').subscribe({
        next: () => done.fail('Should have failed'),
        error: () => {
          expect(console.error).toHaveBeenCalledWith(
            'API Error:',
            errorMessage,
            jasmine.any(Object),
          );
          done();
        },
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips`);
      req.flush({ message: errorMessage }, { status: 500, statusText: 'Error' });
    });
  });

  describe('URL Building', () => {
    it('should call EnvironmentService.getApiEndpoint for URL building', (done) => {
      service.get('trips/1').subscribe({
        next: () => {
          expect(envService.getApiEndpoint).toHaveBeenCalledWith('trips/1');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips/1`);
      req.flush({ id: '1' });
    });

    it('should handle endpoints with leading slash', (done) => {
      service.get('/trips/1').subscribe({
        next: () => {
          expect(envService.getApiEndpoint).toHaveBeenCalledWith('/trips/1');
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips/1`);
      req.flush({ id: '1' });
    });
  });

  describe('Request Options', () => {
    it('should pass custom headers through options', (done) => {
      const customHeaders = { Authorization: 'Bearer token123' };
      const options: RequestOptions = { headers: customHeaders };

      service.get('trips', options).subscribe({
        next: () => {
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
      req.flush([]);
    });

    it('should pass multiple query parameters', (done) => {
      const options: RequestOptions = {
        params: { status: 'active', limit: '10' },
      };

      service.get('trips', options).subscribe({
        next: (data) => {
          expect(data).toBeDefined();
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${mockApiUrl}/trips?status=active&limit=10`);
      req.flush([]);
    });
  });
});
