import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationDisplayComponent } from './location-display.component';
import { MapsService } from '../../services/maps.service';
import { Location } from '../../../../core/models/location.model';

describe('LocationDisplayComponent', () => {
  let component: LocationDisplayComponent;
  let fixture: ComponentFixture<LocationDisplayComponent>;
  let mockMapsService: jasmine.SpyObj<MapsService>;

  const mockLocation: Location = {
    address: '123 Main St',
    city: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    formattedAddress: '123 Main St, Paris, France',
  };

  beforeEach(async () => {
    mockMapsService = jasmine.createSpyObj('MapsService', [
      'isLocationGeocoded',
      'getMapUrl',
      'getShareableMapUrl',
    ]);

    await TestBed.configureTestingModule({
      imports: [LocationDisplayComponent],
      providers: [{ provide: MapsService, useValue: mockMapsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationDisplayComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default input values', () => {
      expect(component.showFullAddress).toBe(true);
      expect(component.showMapLink).toBe(true);
      expect(component.location).toBeUndefined();
      expect(component.label).toBeUndefined();
    });
  });

  describe('Display Text', () => {
    it('should return "No location" when location is undefined', () => {
      component.location = undefined;
      expect(component.displayText).toBe('No location');
    });

    it('should return formatted address when showFullAddress is true', () => {
      component.location = mockLocation;
      component.showFullAddress = true;
      expect(component.displayText).toBe('123 Main St, Paris, France');
    });

    it('should return plain address when formatted address is not available', () => {
      const locationWithoutFormatted = { ...mockLocation };
      delete locationWithoutFormatted.formattedAddress;
      component.location = locationWithoutFormatted;
      component.showFullAddress = true;
      expect(component.displayText).toBe('123 Main St');
    });

    it('should return city and country when showFullAddress is false', () => {
      component.location = mockLocation;
      component.showFullAddress = false;
      expect(component.displayText).toBe('Paris, France');
    });

    it('should return only city when country is not available and showFullAddress is false', () => {
      const locationWithoutCountry = { ...mockLocation, country: undefined };
      component.location = locationWithoutCountry;
      component.showFullAddress = false;
      expect(component.displayText).toBe('Paris');
    });

    it('should fallback to address when city and country are not available', () => {
      const locationWithoutCityCountry = {
        ...mockLocation,
        city: undefined,
        country: undefined,
      };
      component.location = locationWithoutCityCountry;
      component.showFullAddress = false;
      expect(component.displayText).toBe('123 Main St');
    });
  });

  describe('City Country Text', () => {
    it('should return null when location is undefined', () => {
      component.location = undefined;
      expect(component.cityCountryText).toBeNull();
    });

    it('should return null when showFullAddress is false', () => {
      component.location = mockLocation;
      component.showFullAddress = false;
      expect(component.cityCountryText).toBeNull();
    });

    it('should return city and country when both are available', () => {
      component.location = mockLocation;
      component.showFullAddress = true;
      expect(component.cityCountryText).toBe('Paris, France');
    });

    it('should return only city when country is not available', () => {
      const locationWithoutCountry = { ...mockLocation, country: undefined };
      component.location = locationWithoutCountry;
      component.showFullAddress = true;
      expect(component.cityCountryText).toBe('Paris');
    });

    it('should return null when neither city nor country are available', () => {
      const locationWithoutCityCountry = {
        ...mockLocation,
        city: undefined,
        country: undefined,
      };
      component.location = locationWithoutCityCountry;
      component.showFullAddress = true;
      expect(component.cityCountryText).toBeNull();
    });
  });

  describe('Location Validation', () => {
    it('should return false when location is undefined', () => {
      component.location = undefined;
      mockMapsService.isLocationGeocoded.and.returnValue(false);
      expect(component.isLocationValid).toBe(false);
    });

    it('should return true when location is valid and geocoded', () => {
      component.location = mockLocation;
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      expect(component.isLocationValid).toBe(true);
      expect(mockMapsService.isLocationGeocoded).toHaveBeenCalledWith(mockLocation);
    });

    it('should return false when location exists but is not geocoded', () => {
      component.location = mockLocation;
      mockMapsService.isLocationGeocoded.and.returnValue(false);
      expect(component.isLocationValid).toBe(false);
    });
  });

  describe('Map URL', () => {
    it('should return empty string when location is undefined', () => {
      component.location = undefined;
      mockMapsService.isLocationGeocoded.and.returnValue(false);
      expect(component.mapUrl).toBe('');
    });

    it('should return empty string when location is invalid', () => {
      component.location = mockLocation;
      mockMapsService.isLocationGeocoded.and.returnValue(false);
      expect(component.mapUrl).toBe('');
    });

    it('should return shareable map URL when label is provided', () => {
      component.location = mockLocation;
      component.label = 'Hotel Paris';
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      mockMapsService.getShareableMapUrl.and.returnValue('https://maps.google.com/shareable-url');

      expect(component.mapUrl).toBe('https://maps.google.com/shareable-url');
      expect(mockMapsService.getShareableMapUrl).toHaveBeenCalledWith(mockLocation, 'Hotel Paris');
    });

    it('should return regular map URL when label is not provided', () => {
      component.location = mockLocation;
      component.label = undefined;
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      mockMapsService.getMapUrl.and.returnValue('https://maps.google.com/url');

      expect(component.mapUrl).toBe('https://maps.google.com/url');
      expect(mockMapsService.getMapUrl).toHaveBeenCalledWith(mockLocation);
    });
  });

  describe('Open in Maps', () => {
    let windowOpenSpy: jasmine.Spy;

    beforeEach(() => {
      windowOpenSpy = spyOn(window, 'open');
    });

    it('should open new window with map URL when URL is valid', () => {
      component.location = mockLocation;
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      mockMapsService.getMapUrl.and.returnValue('https://maps.google.com/url');

      component.openInMaps();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://maps.google.com/url',
        '_blank',
        'noopener,noreferrer',
      );
    });

    it('should not open window when map URL is empty', () => {
      component.location = undefined;
      mockMapsService.isLocationGeocoded.and.returnValue(false);

      component.openInMaps();

      expect(windowOpenSpy).not.toHaveBeenCalled();
    });

    it('should use shareable URL when label is provided', () => {
      component.location = mockLocation;
      component.label = 'Paris Hotel';
      mockMapsService.isLocationGeocoded.and.returnValue(true);
      mockMapsService.getShareableMapUrl.and.returnValue('https://maps.google.com/shareable');

      component.openInMaps();

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://maps.google.com/shareable',
        '_blank',
        'noopener,noreferrer',
      );
    });
  });

  describe('Input Binding', () => {
    it('should accept location input', () => {
      component.location = mockLocation;
      fixture.detectChanges();
      expect(component.location).toEqual(mockLocation);
    });

    it('should accept label input', () => {
      component.label = 'Test Label';
      fixture.detectChanges();
      expect(component.label).toBe('Test Label');
    });

    it('should accept showFullAddress input', () => {
      component.showFullAddress = false;
      fixture.detectChanges();
      expect(component.showFullAddress).toBe(false);
    });

    it('should accept showMapLink input', () => {
      component.showMapLink = false;
      fixture.detectChanges();
      expect(component.showMapLink).toBe(false);
    });
  });
});
