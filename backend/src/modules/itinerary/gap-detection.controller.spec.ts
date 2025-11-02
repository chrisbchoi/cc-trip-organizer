import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { GapDetectionController } from './gap-detection.controller';
import { GapDetectionService, ItineraryGap } from './gap-detection.service';
import { ItineraryService } from './itinerary.service';
import { ItineraryItem } from './entities/itinerary-item.entity';

describe('GapDetectionController', () => {
  let controller: GapDetectionController;
  let gapDetectionService: jest.Mocked<GapDetectionService>;
  let itineraryService: jest.Mocked<ItineraryService>;

  // Helper function to create mock itinerary item
  const createMockItem = (
    id: string,
    tripId: string,
    type: 'flight' | 'transport' | 'accommodation',
    startDate: Date,
    endDate: Date,
  ): ItineraryItem => {
    const item = new ItineraryItem();
    item.id = id;
    item.tripId = tripId;
    item.type = type;
    item.title = `Test ${type}`;
    item.startDate = startDate;
    item.endDate = endDate;
    item.orderIndex = 0;
    item.notes = '';
    item.createdAt = new Date();
    item.updatedAt = new Date();
    return item;
  };

  // Helper function to create mock gap
  const createMockGap = (
    id: string,
    type: 'time' | 'location' | 'accommodation',
    startItem: ItineraryItem,
    endItem: ItineraryItem | null,
    gapDuration: number,
    severity: 'info' | 'warning' | 'error',
    message: string,
  ): ItineraryGap => ({
    id,
    type,
    startItem,
    endItem,
    gapDuration,
    severity,
    message,
    suggestions: [],
  });

  beforeEach(async () => {
    // Create mock services
    const mockGapDetectionService = {
      detectGaps: jest.fn(),
    };

    const mockItineraryService = {
      findByTripId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GapDetectionController],
      providers: [
        {
          provide: GapDetectionService,
          useValue: mockGapDetectionService,
        },
        {
          provide: ItineraryService,
          useValue: mockItineraryService,
        },
      ],
    }).compile();

    controller = module.get<GapDetectionController>(GapDetectionController);
    gapDetectionService = module.get(GapDetectionService);
    itineraryService = module.get(ItineraryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('detectGaps', () => {
    const tripId = 'trip-123';

    it('should return empty array when trip has no itinerary items', async () => {
      // Arrange
      itineraryService.findByTripId.mockResolvedValue([]);

      // Act
      const result = await controller.detectGaps(tripId);

      // Assert
      expect(result).toEqual([]);
      expect(itineraryService.findByTripId).toHaveBeenCalledWith(tripId);
      expect(gapDetectionService.detectGaps).not.toHaveBeenCalled();
    });

    it('should return empty array when items is null', async () => {
      // Arrange
      itineraryService.findByTripId.mockResolvedValue(null as any);

      // Act
      const result = await controller.detectGaps(tripId);

      // Assert
      expect(result).toEqual([]);
      expect(itineraryService.findByTripId).toHaveBeenCalledWith(tripId);
      expect(gapDetectionService.detectGaps).not.toHaveBeenCalled();
    });

    it('should detect gaps for trip with items', async () => {
      // Arrange
      const startDate1 = new Date('2024-01-01T10:00:00Z');
      const endDate1 = new Date('2024-01-01T12:00:00Z');
      const startDate2 = new Date('2024-01-01T16:00:00Z');
      const endDate2 = new Date('2024-01-01T18:00:00Z');

      const item1 = createMockItem('item-1', tripId, 'flight', startDate1, endDate1);
      const item2 = createMockItem('item-2', tripId, 'transport', startDate2, endDate2);

      const mockGap = createMockGap(
        'gap-1',
        'time',
        item1,
        item2,
        240, // 4 hours in minutes
        'info',
        '4h 0m gap between Test flight and Test transport',
      );

      itineraryService.findByTripId.mockResolvedValue([item1, item2]);
      gapDetectionService.detectGaps.mockResolvedValue([mockGap]);

      // Act
      const result = await controller.detectGaps(tripId);

      // Assert
      expect(result).toEqual([mockGap]);
      expect(itineraryService.findByTripId).toHaveBeenCalledWith(tripId);
      expect(gapDetectionService.detectGaps).toHaveBeenCalledWith(
        [item1, item2],
        [item1], // flights
        [item2], // transports
        [], // accommodations
      );
    });

    it('should detect multiple gap types', async () => {
      // Arrange
      const startDate1 = new Date('2024-01-01T10:00:00Z');
      const endDate1 = new Date('2024-01-01T12:00:00Z');
      const startDate2 = new Date('2024-01-02T10:00:00Z');
      const endDate2 = new Date('2024-01-02T12:00:00Z');

      const item1 = createMockItem('item-1', tripId, 'flight', startDate1, endDate1);
      const item2 = createMockItem('item-2', tripId, 'flight', startDate2, endDate2);

      const timeGap = createMockGap(
        'gap-1',
        'time',
        item1,
        item2,
        1320, // 22 hours
        'warning',
        '22h 0m gap between Test flight and Test flight',
      );

      const accommodationGap = createMockGap(
        'gap-2',
        'accommodation',
        item1,
        item2,
        1320,
        'error',
        'Missing accommodation: 1 night(s) between Test flight and Test flight',
      );

      itineraryService.findByTripId.mockResolvedValue([item1, item2]);
      gapDetectionService.detectGaps.mockResolvedValue([timeGap, accommodationGap]);

      // Act
      const result = await controller.detectGaps(tripId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(timeGap);
      expect(result).toContainEqual(accommodationGap);
    });

    it('should filter items by type for gap detection', async () => {
      // Arrange
      const startDate1 = new Date('2024-01-01T10:00:00Z');
      const endDate1 = new Date('2024-01-01T12:00:00Z');
      const startDate2 = new Date('2024-01-01T14:00:00Z');
      const endDate2 = new Date('2024-01-01T16:00:00Z');
      const startDate3 = new Date('2024-01-01T18:00:00Z');
      const endDate3 = new Date('2024-01-02T10:00:00Z');

      const flight = createMockItem('item-1', tripId, 'flight', startDate1, endDate1);
      const transport = createMockItem('item-2', tripId, 'transport', startDate2, endDate2);
      const accommodation = createMockItem('item-3', tripId, 'accommodation', startDate3, endDate3);

      itineraryService.findByTripId.mockResolvedValue([flight, transport, accommodation]);
      gapDetectionService.detectGaps.mockResolvedValue([]);

      // Act
      await controller.detectGaps(tripId);

      // Assert
      expect(gapDetectionService.detectGaps).toHaveBeenCalledWith(
        [flight, transport, accommodation],
        [flight], // only flights
        [transport], // only transports
        [accommodation], // only accommodations
      );
    });

    it('should return gaps with suggestions', async () => {
      // Arrange
      const startDate1 = new Date('2024-01-01T10:00:00Z');
      const endDate1 = new Date('2024-01-01T12:00:00Z');
      const startDate2 = new Date('2024-01-02T14:00:00Z');
      const endDate2 = new Date('2024-01-02T16:00:00Z');

      const item1 = createMockItem('item-1', tripId, 'flight', startDate1, endDate1);
      const item2 = createMockItem('item-2', tripId, 'flight', startDate2, endDate2);

      const mockGap: ItineraryGap = {
        id: 'gap-1',
        type: 'time',
        startItem: item1,
        endItem: item2,
        gapDuration: 1560, // 26 hours
        severity: 'error',
        message: '1d 2h gap between Test flight and Test flight',
        suggestions: [
          'Consider adding accommodation for this overnight period',
          'Add activities or excursions during this time',
        ],
      };

      itineraryService.findByTripId.mockResolvedValue([item1, item2]);
      gapDetectionService.detectGaps.mockResolvedValue([mockGap]);

      // Act
      const result = await controller.detectGaps(tripId);

      // Assert
      expect(result[0].suggestions).toBeDefined();
      expect(result[0].suggestions).toHaveLength(2);
      expect(result[0].suggestions).toContain('Consider adding accommodation for this overnight period');
    });

    it('should handle location mismatch gaps', async () => {
      // Arrange
      const startDate1 = new Date('2024-01-01T10:00:00Z');
      const endDate1 = new Date('2024-01-01T12:00:00Z');
      const startDate2 = new Date('2024-01-01T14:00:00Z');
      const endDate2 = new Date('2024-01-01T16:00:00Z');

      const item1 = createMockItem('item-1', tripId, 'flight', startDate1, endDate1);
      const item2 = createMockItem('item-2', tripId, 'flight', startDate2, endDate2);

      const locationGap: ItineraryGap = {
        id: 'gap-1',
        type: 'location',
        startItem: item1,
        endItem: item2,
        gapDuration: 0,
        severity: 'warning',
        message: 'Location mismatch: Test flight arrives in Paris but Test flight departs from London',
        suggestions: ['Add transportation between these locations', 'Verify the locations are correct'],
      };

      itineraryService.findByTripId.mockResolvedValue([item1, item2]);
      gapDetectionService.detectGaps.mockResolvedValue([locationGap]);

      // Act
      const result = await controller.detectGaps(tripId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('location');
      expect(result[0].severity).toBe('warning');
    });

    it('should return gaps with all severity levels', async () => {
      // Arrange
      const startDate1 = new Date('2024-01-01T10:00:00Z');
      const endDate1 = new Date('2024-01-01T12:00:00Z');
      const startDate2 = new Date('2024-01-01T15:00:00Z');
      const endDate2 = new Date('2024-01-01T17:00:00Z');
      const startDate3 = new Date('2024-01-02T02:00:00Z');
      const endDate3 = new Date('2024-01-02T04:00:00Z');

      const item1 = createMockItem('item-1', tripId, 'flight', startDate1, endDate1);
      const item2 = createMockItem('item-2', tripId, 'transport', startDate2, endDate2);
      const item3 = createMockItem('item-3', tripId, 'flight', startDate3, endDate3);

      const infoGap = createMockGap('gap-1', 'time', item1, item2, 180, 'info', '3h gap');
      const warningGap = createMockGap('gap-2', 'location', item2, item3, 0, 'warning', 'Location mismatch');
      const errorGap = createMockGap('gap-3', 'accommodation', item2, item3, 540, 'error', 'Missing accommodation');

      itineraryService.findByTripId.mockResolvedValue([item1, item2, item3]);
      gapDetectionService.detectGaps.mockResolvedValue([infoGap, warningGap, errorGap]);

      // Act
      const result = await controller.detectGaps(tripId);

      // Assert
      expect(result).toHaveLength(3);
      expect(result.find(g => g.severity === 'info')).toBeDefined();
      expect(result.find(g => g.severity === 'warning')).toBeDefined();
      expect(result.find(g => g.severity === 'error')).toBeDefined();
    });
  });
});
