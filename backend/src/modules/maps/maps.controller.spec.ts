import { Test, TestingModule } from '@nestjs/testing';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Location } from '../itinerary/types/location.interface';

describe('MapsController', () => {
  let controller: MapsController;
  let mapsService: MapsService;

  const mockLocation: Location = {
    address: '1600 Amphitheatre Parkway, Mountain View, CA',
    formattedAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
    city: 'Mountain View',
    country: 'USA',
    latitude: 37.4224428,
    longitude: -122.0842467,
    placeId: 'ChIJj61dQgK6j4AR4GeTYWZsKWw',
  };

  const mockMapsService = {
    geocodeAddress: jest.fn(),
    getPlaceDetails: jest.fn(),
    generateDirectionsUrl: jest.fn(),
    calculateDistance: jest.fn(),
    getCacheStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapsController],
      providers: [
        {
          provide: MapsService,
          useValue: mockMapsService,
        },
      ],
    }).compile();

    controller = module.get<MapsController>(MapsController);
    mapsService = module.get<MapsService>(MapsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should geocode an address successfully', async () => {
      mockMapsService.geocodeAddress.mockResolvedValue(mockLocation);

      const result = await controller.geocodeAddress({
        address: '1600 Amphitheatre Parkway',
      });

      expect(result).toEqual(mockLocation);
      expect(mockMapsService.geocodeAddress).toHaveBeenCalledWith(
        '1600 Amphitheatre Parkway',
      );
    });

    it('should throw BadRequestException if address is empty', async () => {
      await expect(
        controller.geocodeAddress({ address: '' }),
      ).rejects.toThrow(BadRequestException);

      expect(mockMapsService.geocodeAddress).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if geocoding fails', async () => {
      mockMapsService.geocodeAddress.mockResolvedValue(null);

      await expect(
        controller.geocodeAddress({ address: 'invalid address' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle API key errors', async () => {
      mockMapsService.geocodeAddress.mockRejectedValue(
        new Error('API key not configured'),
      );

      await expect(
        controller.geocodeAddress({ address: 'test address' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle rate limit errors', async () => {
      mockMapsService.geocodeAddress.mockRejectedValue(
        new Error('rate limit exceeded'),
      );

      await expect(
        controller.geocodeAddress({ address: 'test address' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPlaceDetails', () => {
    it('should get place details successfully', async () => {
      mockMapsService.getPlaceDetails.mockResolvedValue(mockLocation);

      const result = await controller.getPlaceDetails('ChIJj61dQgK6j4AR4GeTYWZsKWw');

      expect(result).toEqual(mockLocation);
      expect(mockMapsService.getPlaceDetails).toHaveBeenCalledWith(
        'ChIJj61dQgK6j4AR4GeTYWZsKWw',
      );
    });

    it('should throw BadRequestException if placeId is empty', async () => {
      await expect(controller.getPlaceDetails('')).rejects.toThrow(
        BadRequestException,
      );

      expect(mockMapsService.getPlaceDetails).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if place not found', async () => {
      mockMapsService.getPlaceDetails.mockResolvedValue(null);

      await expect(controller.getPlaceDetails('invalid_place_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDirections', () => {
    it('should generate directions successfully', async () => {
      const directionsUrl = 'https://www.google.com/maps/dir/?api=1&origin=37.4224428,-122.0842467&destination=37.7749,-122.4194';
      const distance = 45.67;

      mockMapsService.generateDirectionsUrl.mockReturnValue(directionsUrl);
      mockMapsService.calculateDistance.mockReturnValue(distance);

      const result = await controller.getDirections({
        from: { latitude: 37.4224428, longitude: -122.0842467 },
        to: { latitude: 37.7749, longitude: -122.4194 },
      });

      expect(result).toEqual({ url: directionsUrl, distance });
      expect(mockMapsService.generateDirectionsUrl).toHaveBeenCalled();
      expect(mockMapsService.calculateDistance).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid origin coordinates', async () => {
      await expect(
        controller.getDirections({
          from: { latitude: 91, longitude: 0 },
          to: { latitude: 37.7749, longitude: -122.4194 },
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockMapsService.generateDirectionsUrl).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid destination coordinates', async () => {
      await expect(
        controller.getDirections({
          from: { latitude: 37.4224428, longitude: -122.0842467 },
          to: { latitude: 0, longitude: 181 },
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockMapsService.generateDirectionsUrl).not.toHaveBeenCalled();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const stats = { total: 42, apiStats: { requestsToday: 15 } };
      mockMapsService.getCacheStats.mockResolvedValue(stats);

      const result = await controller.getCacheStats();

      expect(result).toEqual(stats);
      expect(mockMapsService.getCacheStats).toHaveBeenCalled();
    });

    it('should handle errors when getting cache stats', async () => {
      mockMapsService.getCacheStats.mockRejectedValue(new Error('Database error'));

      await expect(controller.getCacheStats()).rejects.toThrow(BadRequestException);
    });
  });
});
