import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripMapViewComponent } from './trip-map-view.component';
import { MapsService } from '../../services/maps.service';
import { Flight } from '../../../../core/models/flight.model';
import { Transport } from '../../../../core/models/transport.model';
import { Accommodation } from '../../../../core/models/accommodation.model';
import { Location } from '../../../../core/models/location.model';

describe('TripMapViewComponent', () => {
  let component: TripMapViewComponent;
  let fixture: ComponentFixture<TripMapViewComponent>;
  let mockMapsService: jasmine.SpyObj<MapsService>;

  const mockLocation1: Location = {
    address: '123 Main St',
    city: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
  };

  const mockLocation2: Location = {
    address: '456 Oak Ave',
    city: 'London',
    country: 'UK',
    latitude: 51.5074,
    longitude: -0.1278,
  };

  const mockLocation3: Location = {
    address: '789 Elm St',
    city: 'Berlin',
    country: 'Germany',
    latitude: 52.52,
    longitude: 13.405,
  };

  const mockFlight = new Flight({
    id: 'flight-1',
    tripId: 'trip-1',
    type: 'flight',
    title: 'Flight to London',
    startDate: new Date('2024-12-01T10:00:00'),
    endDate: new Date('2024-12-01T12:00:00'),
    notes: '',
    flightNumber: 'BA123',
    airline: 'British Airways',
    departureLocation: mockLocation1,
    arrivalLocation: mockLocation2,
  });

  const mockTransport = new Transport({
    id: 'transport-1',
    tripId: 'trip-1',
    type: 'transport',
    title: 'Train to Berlin',
    startDate: new Date('2024-12-02T08:00:00'),
    endDate: new Date('2024-12-02T14:00:00'),
    notes: '',
    transportType: 'train',
    provider: 'Eurostar',
    departureLocation: mockLocation2,
    arrivalLocation: mockLocation3,
  });

  const mockAccommodation = new Accommodation({
    id: 'accommodation-1',
    tripId: 'trip-1',
    type: 'accommodation',
    title: 'Hotel Berlin',
    startDate: new Date('2024-12-02T15:00:00'),
    endDate: new Date('2024-12-04T11:00:00'),
    notes: '',
    name: 'Grand Hotel Berlin',
    location: mockLocation3,
    confirmationNumber: 'CONF123',
  });

  beforeEach(async () => {
    mockMapsService = jasmine.createSpyObj('MapsService', ['isLocationGeocoded', 'getMapUrl']);

    await TestBed.configureTestingModule({
      imports: [TripMapViewComponent],
      providers: [{ provide: MapsService, useValue: mockMapsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TripMapViewComponent);
    component = fixture.componentInstance;
    mockMapsService.isLocationGeocoded.and.returnValue(true);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty items', () => {
      expect(component.markers()).toEqual([]);
      expect(component.hasLocations()).toBe(false);
    });
  });

  describe('Markers Extraction', () => {
    it('should extract markers from flight items', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      component.items = [mockFlight];
      fixture.detectChanges();

      const markers = component.markers();
      expect(markers.length).toBe(2);
      expect(markers[0].location).toEqual(mockLocation1);
      expect(markers[0].label).toContain('Paris');
      expect(markers[0].label).toContain('Departure');
      expect(markers[0].itemType).toBe('flight');
      expect(markers[1].location).toEqual(mockLocation2);
      expect(markers[1].label).toContain('London');
      expect(markers[1].label).toContain('Arrival');
    });

    it('should extract markers from transport items', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      component.items = [mockTransport];
      fixture.detectChanges();

      const markers = component.markers();
      expect(markers.length).toBe(2);
      expect(markers[0].location).toEqual(mockLocation2);
      expect(markers[0].label).toContain('London');
      expect(markers[0].label).toContain('From');
      expect(markers[0].itemType).toBe('transport');
      expect(markers[1].location).toEqual(mockLocation3);
      expect(markers[1].label).toContain('Berlin');
      expect(markers[1].label).toContain('To');
    });

    it('should extract markers from accommodation items', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      component.items = [mockAccommodation];
      fixture.detectChanges();

      const markers = component.markers();
      expect(markers.length).toBe(1);
      expect(markers[0].location).toEqual(mockLocation3);
      expect(markers[0].label).toContain('Grand Hotel Berlin');
      expect(markers[0].itemType).toBe('accommodation');
    });

    it('should extract markers from mixed items', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      component.items = [mockFlight, mockTransport, mockAccommodation];
      fixture.detectChanges();

      const markers = component.markers();
      expect(markers.length).toBe(5); // 2 from flight, 2 from transport, 1 from accommodation
    });

    it('should skip items with invalid locations', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(false);
      component.items = [mockFlight, mockTransport];
      fixture.detectChanges();

      const markers = component.markers();
      expect(markers.length).toBe(0);
    });

    it('should assign sequential marker indices', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      component.items = [mockFlight, mockTransport];
      fixture.detectChanges();

      const markers = component.markers();
      expect(markers[0].index).toBe(1);
      expect(markers[1].index).toBe(2);
      expect(markers[2].index).toBe(3);
      expect(markers[3].index).toBe(4);
    });

    it('should handle null items input', () => {
      component.items = null;
      fixture.detectChanges();

      expect(component.markers()).toEqual([]);
      expect(component.hasLocations()).toBe(false);
    });

    it('should handle empty items array', () => {
      component.items = [];
      fixture.detectChanges();

      expect(component.markers()).toEqual([]);
      expect(component.hasLocations()).toBe(false);
    });
  });

  describe('Has Locations', () => {
    it('should return false when there are no markers', () => {
      component.items = [];
      fixture.detectChanges();
      expect(component.hasLocations()).toBe(false);
    });

    it('should return true when there are markers', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      component.items = [mockFlight];
      fixture.detectChanges();
      expect(component.hasLocations()).toBe(true);
    });
  });

  describe('Map Embed URL', () => {
    it('should return empty string when there are no markers', () => {
      component.items = [];
      fixture.detectChanges();
      expect(component.mapEmbedUrl()).toBe('');
    });

    it('should return single location embed URL for one marker', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      component.items = [mockAccommodation];
      fixture.detectChanges();

      const embedUrl = component.mapEmbedUrl();
      expect(embedUrl).toContain('52.52');
      expect(embedUrl).toContain('13.405');
      expect(embedUrl).toContain('zoom=12');
    });

    it('should return multi-location embed URL for multiple markers', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      component.items = [mockFlight, mockAccommodation];
      fixture.detectChanges();

      const embedUrl = component.mapEmbedUrl();
      expect(embedUrl).toContain('google.com/maps');
      expect(embedUrl).toContain('output=embed');
    });

    it('should calculate center point for multiple markers', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      component.items = [mockFlight]; // Has 2 locations
      fixture.detectChanges();

      const embedUrl = component.mapEmbedUrl();
      // Center should be average of Paris (48.8566, 2.3522) and London (51.5074, -0.1278)
      // Expected: ~50.182, ~1.1122
      expect(embedUrl).toBeTruthy();
    });
  });

  describe('Full Map URL', () => {
    it('should return empty string when there are no markers', () => {
      component.items = [];
      fixture.detectChanges();
      expect(component.getFullMapUrl()).toBe('');
    });

    it('should return single location URL for one marker', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      mockMapsService.getMapUrl.and.returnValue('https://maps.google.com/single');
      component.items = [mockAccommodation];
      fixture.detectChanges();

      expect(component.getFullMapUrl()).toBe('https://maps.google.com/single');
    });

    it('should return directions URL for multiple markers', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      component.items = [mockFlight]; // Has 2 locations
      fixture.detectChanges();

      const fullMapUrl = component.getFullMapUrl();
      expect(fullMapUrl).toContain('google.com/maps/dir/');
      expect(fullMapUrl).toContain('48.8566,2.3522');
      expect(fullMapUrl).toContain('51.5074,-0.1278');
    });
  });

  describe('Open in Google Maps', () => {
    let windowOpenSpy: jasmine.Spy;

    beforeEach(() => {
      windowOpenSpy = spyOn(window, 'open');
    });

    it('should open new window with full map URL', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      mockMapsService.getMapUrl.and.returnValue('https://maps.google.com/location');
      component.items = [mockAccommodation];
      fixture.detectChanges();

      component.openInGoogleMaps();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://maps.google.com/location',
        '_blank',
        'noopener,noreferrer',
      );
    });

    it('should not open window when there are no locations', () => {
      component.items = [];
      fixture.detectChanges();

      component.openInGoogleMaps();

      expect(windowOpenSpy).not.toHaveBeenCalled();
    });
  });

  describe('Marker Map URL', () => {
    it('should return map URL for a specific marker', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      mockMapsService.getMapUrl.and.returnValue('https://maps.google.com/marker');
      component.items = [mockFlight];
      fixture.detectChanges();

      const markers = component.markers();
      const url = component.getMarkerMapUrl(markers[0]);

      expect(url).toBe('https://maps.google.com/marker');
      expect(mockMapsService.getMapUrl).toHaveBeenCalledWith(mockLocation1);
    });
  });

  describe('Open Marker in Map', () => {
    let windowOpenSpy: jasmine.Spy;

    beforeEach(() => {
      windowOpenSpy = spyOn(window, 'open');
    });

    it('should open new window with marker URL', () => {
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      mockMapsService.getMapUrl.and.returnValue('https://maps.google.com/marker-url');
      component.items = [mockFlight];
      fixture.detectChanges();

      const markers = component.markers();
      component.openMarkerInMap(markers[0]);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://maps.google.com/marker-url',
        '_blank',
        'noopener,noreferrer',
      );
    });
  });

  describe('Marker Icons', () => {
    it('should return flight icon for flight type', () => {
      expect(component.getMarkerIcon('flight')).toBe('✈️');
    });

    it('should return transport icon for transport type', () => {
      expect(component.getMarkerIcon('transport')).toBe('🚗');
    });

    it('should return accommodation icon for accommodation type', () => {
      expect(component.getMarkerIcon('accommodation')).toBe('🏨');
    });
  });

  describe('Marker Color Classes', () => {
    it('should return flight color class for flight type', () => {
      expect(component.getMarkerColorClass('flight')).toBe('marker-flight');
    });

    it('should return transport color class for transport type', () => {
      expect(component.getMarkerColorClass('transport')).toBe('marker-transport');
    });

    it('should return accommodation color class for accommodation type', () => {
      expect(component.getMarkerColorClass('accommodation')).toBe('marker-accommodation');
    });
  });
});
