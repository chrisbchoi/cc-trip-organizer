import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';

import { ItineraryItemComponent } from '../itinerary-item/itinerary-item.component';
import { ItineraryItem } from '../../services/itinerary-api.service';

interface ReorderEvent {
  item: ItineraryItem;
  previousIndex: number;
  currentIndex: number;
  items: ItineraryItem[];
}

@Component({
  selector: 'app-drag-drop-list',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, ItineraryItemComponent],
  templateUrl: './drag-drop-list.component.html',
  styleUrl: './drag-drop-list.component.scss',
})
export class DragDropListComponent {
  @Input() set items(value: ItineraryItem[]) {
    this._items.set(value);
  }

  @Input() disabled = false;

  @Output() itemReordered = new EventEmitter<ReorderEvent>();
  @Output() itemClicked = new EventEmitter<ItineraryItem>();
  @Output() itemEdited = new EventEmitter<ItineraryItem>();
  @Output() itemDeleted = new EventEmitter<ItineraryItem>();

  private _items = signal<ItineraryItem[]>([]);
  items$ = computed(() => this._items());
  
  isDragging = signal<boolean>(false);
  draggedItemId = signal<string | null>(null);

  /**
   * Handle drop event
   */
  onDrop(event: CdkDragDrop<ItineraryItem[]>): void {
    if (event.previousIndex === event.currentIndex) {
      this.isDragging.set(false);
      this.draggedItemId.set(null);
      return;
    }

    const items = [...this._items()];
    const movedItem = items[event.previousIndex];
    
    // Reorder the array
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    
    // Update local state
    this._items.set(items);
    
    // Reset drag state
    this.isDragging.set(false);
    this.draggedItemId.set(null);

    // Emit reorder event
    this.itemReordered.emit({
      item: movedItem,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      items: items,
    });
  }

  /**
   * Handle drag started
   */
  onDragStarted(item: ItineraryItem): void {
    this.isDragging.set(true);
    this.draggedItemId.set(item.id);
  }

  /**
   * Handle drag ended
   */
  onDragEnded(): void {
    this.isDragging.set(false);
    this.draggedItemId.set(null);
  }

  /**
   * Check if item is being dragged
   */
  isItemDragging(itemId: string): boolean {
    return this.draggedItemId() === itemId;
  }

  /**
   * Handle item click
   */
  onItemClick(item: ItineraryItem): void {
    if (!this.isDragging()) {
      this.itemClicked.emit(item);
    }
  }

  /**
   * Handle item edit
   */
  onItemEdit(item: ItineraryItem): void {
    this.itemEdited.emit(item);
  }

  /**
   * Handle item delete
   */
  onItemDelete(item: ItineraryItem): void {
    this.itemDeleted.emit(item);
  }

  /**
   * Track items by ID for performance
   */
  trackByItemId(_index: number, item: ItineraryItem): string {
    return item.id;
  }
}
