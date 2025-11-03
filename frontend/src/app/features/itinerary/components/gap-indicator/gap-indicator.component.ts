import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryGap } from '../../services/itinerary-api.service';

/**
 * Gap severity levels for color coding
 */
export type GapSeverity = 'info' | 'warning' | 'error';

/**
 * Gap Indicator Component
 *
 * Displays visual indicators for gaps in the itinerary timeline.
 * Shows gap duration, type, and provides action to fill the gap.
 *
 * Features:
 * - Color-coded by severity (info/warning/error)
 * - Icon display based on gap type
 * - Duration and time range display
 * - Optional suggestions
 * - Fill gap action button
 */
@Component({
  selector: 'app-gap-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gap-indicator.component.html',
  styleUrl: './gap-indicator.component.scss',
})
export class GapIndicatorComponent {
  @Input({ required: true }) gap!: ItineraryGap;
  @Output() fillGap = new EventEmitter<ItineraryGap>();

  /**
   * Calculate gap severity based on duration
   * - < 3 hours: info (may be intentional)
   * - 3-12 hours: warning (likely needs attention)
   * - > 12 hours: error (definitely needs attention)
   */
  getSeverity(): GapSeverity {
    const hours = this.gap.durationHours;
    
    if (hours < 3) {
      return 'info';
    } else if (hours < 12) {
      return 'warning';
    } else {
      return 'error';
    }
  }

  /**
   * Get CSS class for severity level
   */
  getSeverityClass(): string {
    return `gap-severity-${this.getSeverity()}`;
  }

  /**
   * Get icon for gap type based on suggestion
   */
  getGapIcon(): string {
    if (this.gap.suggestion === 'transport') {
      return '🚗';
    } else if (this.gap.suggestion === 'accommodation') {
      return '🏨';
    } else {
      return '⏰';
    }
  }

  /**
   * Get gap type label
   */
  getGapTypeLabel(): string {
    if (this.gap.suggestion === 'transport') {
      return 'Missing Transportation';
    } else if (this.gap.suggestion === 'accommodation') {
      return 'Missing Accommodation';
    } else {
      return 'Time Gap';
    }
  }

  /**
   * Format duration in hours and minutes
   */
  formatDuration(): string {
    const hours = Math.floor(this.gap.durationHours);
    const minutes = Math.round((this.gap.durationHours - hours) * 60);
    
    if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Format date and time for display
   */
  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Get gap message based on severity and type
   */
  getGapMessage(): string {
    const duration = this.formatDuration();
    const severity = this.getSeverity();
    
    if (this.gap.suggestion === 'transport') {
      if (severity === 'error') {
        return `You have a ${duration} gap without transportation. You may need to arrange travel between locations.`;
      } else {
        return `There's a ${duration} gap in your itinerary. Consider adding transportation if needed.`;
      }
    } else if (this.gap.suggestion === 'accommodation') {
      if (severity === 'error') {
        return `You have a ${duration} gap without accommodation. You may need to book lodging for this period.`;
      } else {
        return `There's a ${duration} gap in your itinerary. Consider adding accommodation if needed.`;
      }
    } else {
      if (severity === 'info') {
        return `There's a ${duration} gap in your itinerary. This may be intentional.`;
      } else {
        return `You have a ${duration} gap in your itinerary. You may want to fill this gap.`;
      }
    }
  }

  /**
   * Get suggestion text for the gap
   */
  getSuggestionText(): string | null {
    if (this.gap.suggestion === 'transport') {
      return 'Add transportation to connect these locations';
    } else if (this.gap.suggestion === 'accommodation') {
      return 'Add accommodation for overnight stay';
    }
    return null;
  }

  /**
   * Handle fill gap button click
   */
  onFillGap(): void {
    this.fillGap.emit(this.gap);
  }
}
