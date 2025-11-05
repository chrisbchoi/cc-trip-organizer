import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropListComponent } from './drag-drop-list.component';
import { Flight } from '../../../../core/models/flight.model';
import { Transport } from '../../../../core/models/transport.model';
import { Accommodation } from '../../../../core/models/accommodation.model';

type ItineraryItem = Flight | Transport | Accommodation;

describe('DragDropListComponent', () => {
  let component: DragDropListComponent;
  let fixture: ComponentFixture<DragDropListComponent>;

  const mockItems: ItineraryItem[] = [
    new Flight({
      id: 'item-1',
      tripId: 'trip-1',
      type: 'flight',
      title: 'Flight 1',
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
      title: 'Transport 1',
      startDate: new Date('2024-12-01T11:00:00'),
      endDate: new Date('2024-12-01T13:00:00'),
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
      title: 'Hotel 1',
      startDate: new Date('2024-12-01T15:00:00'),
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
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragDropListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DragDropListComponent);
    component = fixture.componentInstance;
    component.items = mockItems;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with provided items', () => {
      expect(component.items$()).toEqual(mockItems);
    });

    it('should initialize with empty array if no items provided', () => {
      const emptyComponent = TestBed.createComponent(DragDropListComponent).componentInstance;
      expect(emptyComponent.items$()).toEqual([]);
    });

    it('should initialize drag state as false', () => {
      expect(component.isDragging()).toBe(false);
    });

    it('should initialize dragged item ID as null', () => {
      expect(component.draggedItemId()).toBeNull();
    });

    it('should have disabled flag as false by default', () => {
      expect(component.disabled).toBe(false);
    });
  });

  describe('Item Input', () => {
    it('should update items when input changes', () => {
      const newItems = [mockItems[0], mockItems[1]];
      component.items = newItems;
      expect(component.items$()).toEqual(newItems);
    });

    it('should handle empty items array', () => {
      component.items = [];
      expect(component.items$()).toEqual([]);
    });

    it('should update signal when items change', () => {
      const singleItem = [mockItems[0]];
      component.items = singleItem;
      expect(component.items$().length).toBe(1);
      expect(component.items$()[0].id).toBe('item-1');
    });
  });

  describe('Drag State Management', () => {
    it('should set dragging state when drag starts', () => {
      component.onDragStarted(mockItems[0]);
      expect(component.isDragging()).toBe(true);
    });

    it('should set dragged item ID when drag starts', () => {
      component.onDragStarted(mockItems[0]);
      expect(component.draggedItemId()).toBe('item-1');
    });

    it('should reset dragging state when drag ends', () => {
      component.onDragStarted(mockItems[0]);
      component.onDragEnded();
      expect(component.isDragging()).toBe(false);
    });

    it('should reset dragged item ID when drag ends', () => {
      component.onDragStarted(mockItems[0]);
      component.onDragEnded();
      expect(component.draggedItemId()).toBeNull();
    });

    it('should correctly identify dragging item', () => {
      component.onDragStarted(mockItems[1]);
      expect(component.isItemDragging('item-2')).toBe(true);
      expect(component.isItemDragging('item-1')).toBe(false);
    });
  });

  describe('Drop Handling', () => {
    it('should not emit reorder event if dropped in same position', () => {
      const reorderSpy = jasmine.createSpy('reorderSpy');
      component.itemReordered.subscribe(reorderSpy);

      const event = {
        previousIndex: 1,
        currentIndex: 1,
        item: {} as unknown as CdkDragDrop<ItineraryItem[]>['item'],
        container: {} as unknown as CdkDragDrop<ItineraryItem[]>['container'],
        previousContainer: {} as unknown as CdkDragDrop<ItineraryItem[]>['previousContainer'],
        isPointerOverContainer: true,
        distance: { x: 0, y: 0 },
        dropPoint: { x: 0, y: 0 },
        event: {} as unknown as MouseEvent,
      } as CdkDragDrop<ItineraryItem[]>;

      component.onDrop(event);

      expect(reorderSpy).not.toHaveBeenCalled();
    });

    it('should reset drag state even if dropped in same position', () => {
      component.onDragStarted(mockItems[0]);

      const event = {
        previousIndex: 0,
        currentIndex: 0,
      } as CdkDragDrop<ItineraryItem[]>;

      component.onDrop(event);

      expect(component.isDragging()).toBe(false);
      expect(component.draggedItemId()).toBeNull();
    });

    it('should emit reorder event when item is moved', () => {
      const reorderSpy = jasmine.createSpy('reorderSpy');
      component.itemReordered.subscribe(reorderSpy);

      const event = {
        previousIndex: 0,
        currentIndex: 2,
      } as CdkDragDrop<ItineraryItem[]>;

      component.onDrop(event);

      expect(reorderSpy).toHaveBeenCalled();
    });

    it('should emit correct reorder event data', () => {
      const reorderSpy = jasmine.createSpy('reorderSpy');
      component.itemReordered.subscribe(reorderSpy);

      const event = {
        previousIndex: 0,
        currentIndex: 2,
      } as CdkDragDrop<ItineraryItem[]>;

      component.onDrop(event);

      expect(reorderSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          item: mockItems[0],
          previousIndex: 0,
          currentIndex: 2,
        }),
      );
    });

    it('should update local items array after reorder', () => {
      const event = {
        previousIndex: 0,
        currentIndex: 2,
      } as CdkDragDrop<ItineraryItem[]>;

      component.onDrop(event);

      const items = component.items$();
      expect(items[2].id).toBe('item-1'); // First item moved to last
      expect(items[0].id).toBe('item-2'); // Second item moved to first
    });

    it('should emit reordered items array', () => {
      const reorderSpy = jasmine.createSpy('reorderSpy');
      component.itemReordered.subscribe(reorderSpy);

      const event = {
        previousIndex: 1,
        currentIndex: 0,
      } as CdkDragDrop<ItineraryItem[]>;

      component.onDrop(event);

      const emittedItems = reorderSpy.calls.mostRecent().args[0].items;
      expect(emittedItems[0].id).toBe('item-2');
      expect(emittedItems[1].id).toBe('item-1');
    });

    it('should reset drag state after drop', () => {
      component.onDragStarted(mockItems[0]);

      const event = {
        previousIndex: 0,
        currentIndex: 1,
      } as CdkDragDrop<ItineraryItem[]>;

      component.onDrop(event);

      expect(component.isDragging()).toBe(false);
      expect(component.draggedItemId()).toBeNull();
    });
  });

  describe('Item Interactions', () => {
    it('should emit click event when item is clicked', () => {
      const clickSpy = jasmine.createSpy('clickSpy');
      component.itemClicked.subscribe(clickSpy);

      component.onItemClick(mockItems[0]);

      expect(clickSpy).toHaveBeenCalledWith(mockItems[0]);
    });

    it('should not emit click event when dragging', () => {
      const clickSpy = jasmine.createSpy('clickSpy');
      component.itemClicked.subscribe(clickSpy);

      component.onDragStarted(mockItems[0]);
      component.onItemClick(mockItems[0]);

      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('should emit edit event when item is edited', () => {
      const editSpy = jasmine.createSpy('editSpy');
      component.itemEdited.subscribe(editSpy);

      component.onItemEdit(mockItems[1]);

      expect(editSpy).toHaveBeenCalledWith(mockItems[1]);
    });

    it('should emit delete event when item is deleted', () => {
      const deleteSpy = jasmine.createSpy('deleteSpy');
      component.itemDeleted.subscribe(deleteSpy);

      component.onItemDelete(mockItems[2]);

      expect(deleteSpy).toHaveBeenCalledWith(mockItems[2]);
    });

    it('should emit correct item data', () => {
      const editSpy = jasmine.createSpy('editSpy');
      component.itemEdited.subscribe(editSpy);

      component.onItemEdit(mockItems[0]);

      expect(editSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 'item-1',
          type: 'flight',
        }),
      );
    });
  });

  describe('Track By Function', () => {
    it('should return item ID for tracking', () => {
      const result = component.trackByItemId(0, mockItems[0]);
      expect(result).toBe('item-1');
    });

    it('should return correct ID for different items', () => {
      expect(component.trackByItemId(0, mockItems[0])).toBe('item-1');
      expect(component.trackByItemId(1, mockItems[1])).toBe('item-2');
      expect(component.trackByItemId(2, mockItems[2])).toBe('item-3');
    });

    it('should ignore index parameter', () => {
      const result1 = component.trackByItemId(0, mockItems[1]);
      const result2 = component.trackByItemId(999, mockItems[1]);
      expect(result1).toBe(result2);
      expect(result1).toBe('item-2');
    });
  });

  describe('Disabled State', () => {
    it('should respect disabled input', () => {
      component.disabled = true;
      expect(component.disabled).toBe(true);
    });

    it('should allow enabling after being disabled', () => {
      component.disabled = true;
      component.disabled = false;
      expect(component.disabled).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete drag-drop workflow', () => {
      const reorderSpy = jasmine.createSpy('reorderSpy');
      component.itemReordered.subscribe(reorderSpy);

      // Start dragging
      component.onDragStarted(mockItems[0]);
      expect(component.isDragging()).toBe(true);

      // Drop
      const event = {
        previousIndex: 0,
        currentIndex: 2,
      } as CdkDragDrop<ItineraryItem[]>;
      component.onDrop(event);

      // Verify state
      expect(component.isDragging()).toBe(false);
      expect(reorderSpy).toHaveBeenCalled();
    });

    it('should handle multiple drag operations', () => {
      component.onDragStarted(mockItems[0]);
      component.onDragEnded();

      component.onDragStarted(mockItems[1]);
      expect(component.draggedItemId()).toBe('item-2');

      component.onDragEnded();
      expect(component.draggedItemId()).toBeNull();
    });

    it('should prevent click during drag', () => {
      const clickSpy = jasmine.createSpy('clickSpy');
      component.itemClicked.subscribe(clickSpy);

      component.onDragStarted(mockItems[0]);
      component.onItemClick(mockItems[0]);

      expect(clickSpy).not.toHaveBeenCalled();

      component.onDragEnded();
      component.onItemClick(mockItems[0]);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should maintain item data integrity after reorder', () => {
      const originalFirstItem = { ...mockItems[0] };
      const originalSecondItem = { ...mockItems[1] };

      const event = {
        previousIndex: 0,
        currentIndex: 1,
      } as CdkDragDrop<ItineraryItem[]>;

      component.onDrop(event);

      const items = component.items$();
      expect(items[1].id).toBe(originalFirstItem.id);
      expect(items[0].id).toBe(originalSecondItem.id);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item array', () => {
      component.items = [mockItems[0]];
      expect(component.items$().length).toBe(1);

      const event = {
        previousIndex: 0,
        currentIndex: 0,
      } as CdkDragDrop<ItineraryItem[]>;

      component.onDrop(event);
      expect(component.items$().length).toBe(1);
    });

    it('should handle empty items array', () => {
      component.items = [];
      expect(component.items$()).toEqual([]);
    });

    it('should handle rapid drag state changes', () => {
      component.onDragStarted(mockItems[0]);
      component.onDragEnded();
      component.onDragStarted(mockItems[1]);
      component.onDragEnded();

      expect(component.isDragging()).toBe(false);
      expect(component.draggedItemId()).toBeNull();
    });
  });
});
