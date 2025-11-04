import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryItem, ItineraryGap } from '../../services/itinerary-api.service';
import { DragDropListComponent, ReorderEvent } from '../drag-drop-list/drag-drop-list.component';
import { GapIndicatorComponent } from '../gap-indicator/gap-indicator.component';

/**
 * Interface for grouped itinerary items by date
 */
interface GroupedItems {
  date: Date;
  dateLabel: string;
  items: ItineraryItem[];
}

/**
 * ItineraryTimelineComponent
 *
 * Presentation component that displays itinerary items in a visual timeline
 * grouped by date with gap indicators and drag-and-drop support.
 *
 * Features:
 * - Groups items chronologically by date
 * - Displays items with color coding by type
 * - Shows gap indicators between items
 * - Supports drag-and-drop reordering within date groups
 * - Emits events for item interactions
 * - Responsive design
 *
 * Usage:
 * <app-itinerary-timeline
 *   [items]="itineraryItems"
 *   [gaps]="detectedGaps"
 *   [enableDragDrop]="true"
 *   (itemClick)="onItemClick($event)"
 *   (itemEdit)="onItemEdit($event)"
 *   (itemDelete)="onItemDelete($event)"
 *   (itemReorder)="onItemReorder($event)">
 * </app-itinerary-timeline>
 */
@Component({
  selector: 'app-itinerary-timeline',
  standalone: true,
  imports: [CommonModule, DragDropListComponent, GapIndicatorComponent],
  templateUrl: './itinerary-timeline.component.html',
  styleUrl: './itinerary-timeline.component.scss',
})
export class ItineraryTimelineComponent {
  /**
   * Array of itinerary items to display
   */
  @Input() items: ItineraryItem[] = [];

  /**
   * Array of detected gaps between items
   */
  @Input() gaps: ItineraryGap[] = [];

  /**
   * Whether to enable drag-and-drop reordering
   */
  @Input() enableDragDrop = true;

  /**
   * Event emitted when an item is clicked for viewing/editing
   */
  @Output() itemClick = new EventEmitter<ItineraryItem>();

  /**
   * Event emitted when an item edit is requested
   */
  @Output() itemEdit = new EventEmitter<ItineraryItem>();

  /**
   * Event emitted when an item delete is requested
   */
  @Output() itemDelete = new EventEmitter<ItineraryItem>();

  /**
   * Event emitted when items are reordered via drag-and-drop
   */
  @Output() itemReorder = new EventEmitter<ReorderEvent>();

  /**
   * Group items by date for display
   * @returns Array of grouped items by date
   */
  get groupedItems(): GroupedItems[] {
    if (!this.items || this.items.length === 0) {
      return [];
    }

    // Sort items chronologically
    const sortedItems = [...this.items].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );

    // Group by date
    const groups = new Map<string, GroupedItems>();

    sortedItems.forEach((item) => {
      const dateKey = this.getDateKey(item.startDate);

      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          date: this.getStartOfDay(item.startDate),
          dateLabel: this.formatDateLabel(item.startDate),
          items: [],
        });
      }

      groups.get(dateKey)!.items.push(item);
    });

    return Array.from(groups.values());
  }

  /**
   * Get a date key for grouping (YYYY-MM-DD)
   */
  private getDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get start of day for a given date
   */
  private getStartOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  /**
   * Format date label for display (e.g., "Monday, January 15, 2024")
   */
  private formatDateLabel(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Handle item reorder from drag-drop component
   */
  onItemReordered(event: ReorderEvent): void {
    this.itemReorder.emit(event);
  }

  /**
   * Handle item click from drag-drop component
   */
  onItemClicked(item: ItineraryItem): void {
    this.itemClick.emit(item);
  }

  /**
   * Handle item edit from drag-drop component
   */
  onItemEdited(item: ItineraryItem): void {
    this.itemEdit.emit(item);
  }

  /**
   * Handle item delete from drag-drop component
   */
  onItemDeleted(item: ItineraryItem): void {
    this.itemDelete.emit(item);
  }

  /**
   * Get gaps that should be displayed within a specific date group
   */
  getGapsForGroup(groupItems: ItineraryItem[]): ItineraryGap[] {
    if (!this.gaps || this.gaps.length === 0 || !groupItems || groupItems.length === 0) {
      return [];
    }

    // Find gaps that occur between consecutive items in this group
    const relevantGaps: ItineraryGap[] = [];

    for (let i = 0; i < groupItems.length - 1; i++) {
      const currentItem = groupItems[i];
      const nextItem = groupItems[i + 1];

      // Find gap that starts after current item ends and before next item starts
      const gap = this.gaps.find((g) => {
        const gapStart = new Date(g.startDateTime).getTime();
        const gapEnd = new Date(g.endDateTime).getTime();
        const itemEnd = currentItem.endDate.getTime();
        const nextStart = nextItem.startDate.getTime();

        // Gap should be between these two items
        return gapStart >= itemEnd && gapEnd <= nextStart;
      });

      if (gap) {
        relevantGaps.push(gap);
      }
    }

    return relevantGaps;
  }
}
