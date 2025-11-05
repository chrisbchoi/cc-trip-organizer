import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItineraryTimelineComponent } from './itinerary-timeline.component';
import { ItineraryGap } from '../../services/itinerary-api.service';
import { ReorderEvent } from '../drag-drop-list/drag-drop-list.component';
import { Flight } from '../../../../core/models/flight.model';
import { Transport } from '../../../../core/models/transport.model';
import { Accommodation } from '../../../../core/models/accommodation.model';

type ItineraryItem = Flight | Transport | Accommodation;

describe('ItineraryTimelineComponent', () => {
  let component: ItineraryTimelineComponent;
  let fixture: ComponentFixture<ItineraryTimelineComponent>;

  const mockItems: ItineraryItem[] = [
    new Flight({
      id: 'item-1',
      tripId: 'trip-1',
      type: 'flight',
      title: 'Morning Flight',
      startDate: new Date('2024-12-01T08:00:00'),
      endDate: new Date('2024-12-01T10:00:00'),
      flightNumber: 'AA123',
      airline: 'American Airlines',
      departureLocation: {
        address: 'LAX',
        city: 'Los Angeles',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
      },
      arrivalLocation: {
        address: 'JFK',
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.006,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      orderIndex: 1,
    }),
    new Transport({
      id: 'item-2',
      tripId: 'trip-1',
      type: 'transport',
      title: 'Train',
      startDate: new Date('2024-12-01T14:00:00'),
      endDate: new Date('2024-12-01T16:00:00'),
      transportType: 'train',
      departureLocation: {
        address: 'Station A',
        city: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
      },
      arrivalLocation: {
        address: 'Station B',
        city: 'Brussels',
        country: 'Belgium',
        latitude: 50.8503,
        longitude: 4.3517,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      orderIndex: 2,
    }),
    new Accommodation({
      id: 'item-3',
      tripId: 'trip-1',
      type: 'accommodation',
      title: 'Hotel Night 1',
      startDate: new Date('2024-12-01T18:00:00'),
      endDate: new Date('2024-12-02T11:00:00'),
      name: 'Hotel California',
      location: {
        address: '123 Main St',
        city: 'Los Angeles',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      orderIndex: 3,
    }),
    new Flight({
      id: 'item-4',
      tripId: 'trip-1',
      type: 'flight',
      title: 'Next Day Flight',
      startDate: new Date('2024-12-02T14:00:00'),
      endDate: new Date('2024-12-02T16:00:00'),
      flightNumber: 'AA456',
      airline: 'American Airlines',
      departureLocation: {
        address: 'JFK',
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.006,
      },
      arrivalLocation: {
        address: 'LAX',
        city: 'Los Angeles',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      orderIndex: 4,
    }),
  ];

  const mockGaps: ItineraryGap[] = [
    {
      startDateTime: '2024-12-01T10:00:00',
      endDateTime: '2024-12-01T14:00:00',
      durationHours: 4,
      suggestion: 'transport',
    },
    {
      startDateTime: '2024-12-02T11:00:00',
      endDateTime: '2024-12-02T14:00:00',
      durationHours: 3,
      suggestion: undefined,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraryTimelineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItineraryTimelineComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with empty items array', () => {
      expect(component.items).toEqual([]);
    });

    it('should initialize with empty gaps array', () => {
      expect(component.gaps).toEqual([]);
    });

    it('should have drag-drop enabled by default', () => {
      expect(component.enableDragDrop).toBe(true);
    });

    it('should accept items input', () => {
      component.items = mockItems;
      fixture.detectChanges();
      expect(component.items.length).toBe(4);
    });

    it('should accept gaps input', () => {
      component.gaps = mockGaps;
      fixture.detectChanges();
      expect(component.gaps.length).toBe(2);
    });

    it('should allow disabling drag-drop', () => {
      component.enableDragDrop = false;
      expect(component.enableDragDrop).toBe(false);
    });
  });

  describe('Item Grouping', () => {
    beforeEach(() => {
      component.items = mockItems;
      fixture.detectChanges();
    });

    it('should group items by date', () => {
      const grouped = component.groupedItems;
      expect(grouped.length).toBe(2); // 2 different dates
    });

    it('should have correct number of items in each group', () => {
      const grouped = component.groupedItems;
      expect(grouped[0].items.length).toBe(3); // 3 items on Dec 1
      expect(grouped[1].items.length).toBe(1); // 1 item on Dec 2
    });

    it('should sort items chronologically', () => {
      const grouped = component.groupedItems;
      const firstGroupItems = grouped[0].items;
      expect(firstGroupItems[0].id).toBe('item-1'); // 8:00 AM
      expect(firstGroupItems[1].id).toBe('item-2'); // 2:00 PM
      expect(firstGroupItems[2].id).toBe('item-3'); // 6:00 PM
    });

    it('should format date labels correctly', () => {
      const grouped = component.groupedItems;
      expect(grouped[0].dateLabel).toContain('December');
      expect(grouped[0].dateLabel).toContain('1');
      expect(grouped[0].dateLabel).toContain('2024');
    });

    it('should set date at start of day', () => {
      const grouped = component.groupedItems;
      const date = grouped[0].date;
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
    });

    it('should return empty array for no items', () => {
      component.items = [];
      const grouped = component.groupedItems;
      expect(grouped).toEqual([]);
    });

    it('should handle items on same date', () => {
      const sameDayItems = [
        { ...mockItems[0], id: 'a', startDate: new Date('2024-12-01T08:00:00') },
        { ...mockItems[0], id: 'b', startDate: new Date('2024-12-01T12:00:00') },
        { ...mockItems[0], id: 'c', startDate: new Date('2024-12-01T18:00:00') },
      ] as ItineraryItem[];

      component.items = sameDayItems;
      const grouped = component.groupedItems;
      expect(grouped.length).toBe(1);
      expect(grouped[0].items.length).toBe(3);
    });

    it('should handle items spanning multiple days', () => {
      const multiDayItems = [
        { ...mockItems[0], startDate: new Date('2024-12-01T08:00:00') },
        { ...mockItems[0], startDate: new Date('2024-12-02T08:00:00') },
        { ...mockItems[0], startDate: new Date('2024-12-03T08:00:00') },
      ] as ItineraryItem[];

      component.items = multiDayItems;
      const grouped = component.groupedItems;
      expect(grouped.length).toBe(3);
    });
  });

  describe('Gap Filtering', () => {
    beforeEach(() => {
      component.items = mockItems;
      component.gaps = mockGaps;
      fixture.detectChanges();
    });

    it('should filter gaps for specific group', () => {
      const grouped = component.groupedItems;
      const gapsForFirstGroup = component.getGapsForGroup(grouped[0].items);
      expect(gapsForFirstGroup.length).toBeGreaterThan(0);
    });

    it('should return empty array if no gaps provided', () => {
      component.gaps = [];
      const grouped = component.groupedItems;
      const gapsForGroup = component.getGapsForGroup(grouped[0].items);
      expect(gapsForGroup).toEqual([]);
    });

    it('should return empty array if no items in group', () => {
      const gapsForGroup = component.getGapsForGroup([]);
      expect(gapsForGroup).toEqual([]);
    });

    it('should return empty array for single item group', () => {
      const gapsForGroup = component.getGapsForGroup([mockItems[0]]);
      expect(gapsForGroup).toEqual([]);
    });

    it('should find gaps between consecutive items', () => {
      const items = [
        {
          id: '1',
          startDate: new Date('2024-12-01T08:00:00'),
          endDate: new Date('2024-12-01T10:00:00'),
        },
        {
          id: '2',
          startDate: new Date('2024-12-01T14:00:00'),
          endDate: new Date('2024-12-01T16:00:00'),
        },
      ] as ItineraryItem[];

      const gap = {
        startDateTime: '2024-12-01T10:00:00',
        endDateTime: '2024-12-01T14:00:00',
        durationHours: 4,
      };

      component.gaps = [gap];
      const foundGaps = component.getGapsForGroup(items);
      expect(foundGaps.length).toBe(1);
      expect(foundGaps[0]).toEqual(gap);
    });

    it('should not include gaps from other date groups', () => {
      const grouped = component.groupedItems;
      const gapsForSecondGroup = component.getGapsForGroup(grouped[1].items);
      // Second group only has 1 item, so no gaps between items
      expect(gapsForSecondGroup.length).toBe(0);
    });
  });

  describe('Event Emissions', () => {
    it('should emit itemClick when item is clicked', () => {
      const clickSpy = jasmine.createSpy('clickSpy');
      component.itemClick.subscribe(clickSpy);

      component.onItemClicked(mockItems[0]);

      expect(clickSpy).toHaveBeenCalledWith(mockItems[0]);
    });

    it('should emit itemEdit when item is edited', () => {
      const editSpy = jasmine.createSpy('editSpy');
      component.itemEdit.subscribe(editSpy);

      component.onItemEdited(mockItems[1]);

      expect(editSpy).toHaveBeenCalledWith(mockItems[1]);
    });

    it('should emit itemDelete when item is deleted', () => {
      const deleteSpy = jasmine.createSpy('deleteSpy');
      component.itemDelete.subscribe(deleteSpy);

      component.onItemDeleted(mockItems[2]);

      expect(deleteSpy).toHaveBeenCalledWith(mockItems[2]);
    });

    it('should emit itemReorder when items are reordered', () => {
      const reorderSpy = jasmine.createSpy('reorderSpy');
      component.itemReorder.subscribe(reorderSpy);

      const reorderEvent: ReorderEvent = {
        item: mockItems[0],
        previousIndex: 0,
        currentIndex: 1,
        items: mockItems,
      };

      component.onItemReordered(reorderEvent);

      expect(reorderSpy).toHaveBeenCalledWith(reorderEvent);
    });

    it('should pass through reorder event data', () => {
      const reorderSpy = jasmine.createSpy('reorderSpy');
      component.itemReorder.subscribe(reorderSpy);

      const reorderEvent: ReorderEvent = {
        item: mockItems[1],
        previousIndex: 1,
        currentIndex: 0,
        items: [mockItems[1], mockItems[0], mockItems[2]],
      };

      component.onItemReordered(reorderEvent);

      expect(reorderSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          previousIndex: 1,
          currentIndex: 0,
        }),
      );
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      component.items = mockItems;
      component.gaps = mockGaps;
      fixture.detectChanges();
    });

    it('should display grouped items correctly', () => {
      const grouped = component.groupedItems;
      expect(grouped.length).toBe(2);
      expect(grouped[0].items[0].title).toBe('Morning Flight');
    });

    it('should handle item interactions within groups', () => {
      const clickSpy = jasmine.createSpy('clickSpy');
      component.itemClick.subscribe(clickSpy);

      const grouped = component.groupedItems;
      component.onItemClicked(grouped[0].items[0]);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should maintain chronological order across operations', () => {
      const grouped = component.groupedItems;
      expect(grouped[0].items[0].startDate.getHours()).toBe(8);
      expect(grouped[0].items[1].startDate.getHours()).toBe(14);
      expect(grouped[0].items[2].startDate.getHours()).toBe(18);
    });

    it('should handle empty state gracefully', () => {
      component.items = [];
      component.gaps = [];
      const grouped = component.groupedItems;
      expect(grouped).toEqual([]);
    });

    it('should update grouping when items change', () => {
      expect(component.groupedItems.length).toBe(2);

      component.items = [mockItems[0], mockItems[1]];
      expect(component.groupedItems.length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle items with same start time', () => {
      const sameTimeItems = [
        { ...mockItems[0], id: '1', startDate: new Date('2024-12-01T10:00:00') },
        { ...mockItems[0], id: '2', startDate: new Date('2024-12-01T10:00:00') },
      ] as ItineraryItem[];

      component.items = sameTimeItems;
      const grouped = component.groupedItems;
      expect(grouped[0].items.length).toBe(2);
    });

    it('should handle unsorted items', () => {
      const unsortedItems = [mockItems[3], mockItems[0], mockItems[2], mockItems[1]];
      component.items = unsortedItems;

      const grouped = component.groupedItems;
      // Should still be sorted chronologically
      expect(grouped[0].items[0].startDate.getHours()).toBeLessThan(
        grouped[0].items[1].startDate.getHours(),
      );
    });

    it('should handle midnight boundary', () => {
      const midnightItems = [
        { ...mockItems[0], startDate: new Date('2024-12-01T23:30:00') },
        { ...mockItems[0], startDate: new Date('2024-12-02T00:30:00') },
      ] as ItineraryItem[];

      component.items = midnightItems;
      const grouped = component.groupedItems;
      expect(grouped.length).toBe(2); // Should be two different days
    });

    it('should handle gaps at boundaries', () => {
      const items = [
        {
          id: '1',
          startDate: new Date('2024-12-01T08:00:00'),
          endDate: new Date('2024-12-01T10:00:00'),
        },
        {
          id: '2',
          startDate: new Date('2024-12-01T14:00:00'),
          endDate: new Date('2024-12-01T16:00:00'),
        },
      ] as ItineraryItem[];

      const gap = {
        startDateTime: '2024-12-01T10:00:00',
        endDateTime: '2024-12-01T14:00:00',
        durationHours: 4,
      };

      component.items = items;
      component.gaps = [gap];

      const gapsForGroup = component.getGapsForGroup(items);
      expect(gapsForGroup.length).toBe(1);
    });
  });

  describe('Drag-Drop State', () => {
    it('should pass enableDragDrop to child components', () => {
      component.enableDragDrop = true;
      fixture.detectChanges();
      expect(component.enableDragDrop).toBe(true);
    });

    it('should allow toggling drag-drop', () => {
      component.enableDragDrop = false;
      fixture.detectChanges();
      expect(component.enableDragDrop).toBe(false);

      component.enableDragDrop = true;
      fixture.detectChanges();
      expect(component.enableDragDrop).toBe(true);
    });
  });
});
