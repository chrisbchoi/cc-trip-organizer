import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoSaveStatus } from '../../../core/services/auto-save.service';

/**
 * SaveStatusIndicatorComponent
 *
 * Displays the current auto-save status with appropriate icon and message.
 *
 * Features:
 * - Visual feedback for save status (idle, saving, saved, error)
 * - Color-coded status indicators
 * - Icon support for each status
 * - Animated saving state
 *
 * Usage:
 * ```html
 * <app-save-status-indicator [status]="autoSaveStatus"></app-save-status-indicator>
 * ```
 */
@Component({
  selector: 'app-save-status-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './save-status-indicator.component.html',
  styleUrl: './save-status-indicator.component.scss',
})
export class SaveStatusIndicatorComponent {
  /**
   * Current save status to display
   */
  @Input() status: AutoSaveStatus = AutoSaveStatus.IDLE;

  /**
   * Expose AutoSaveStatus enum to template
   */
  readonly AutoSaveStatus = AutoSaveStatus;

  /**
   * Get the display message for the current status
   */
  get statusMessage(): string {
    switch (this.status) {
      case AutoSaveStatus.IDLE:
        return '';
      case AutoSaveStatus.SAVING:
        return 'Saving...';
      case AutoSaveStatus.SAVED:
        return 'All changes saved';
      case AutoSaveStatus.ERROR:
        return 'Error saving changes';
      default:
        return '';
    }
  }

  /**
   * Get the icon for the current status
   */
  get statusIcon(): string {
    switch (this.status) {
      case AutoSaveStatus.SAVING:
        return '⏳';
      case AutoSaveStatus.SAVED:
        return '✓';
      case AutoSaveStatus.ERROR:
        return '⚠';
      default:
        return '';
    }
  }

  /**
   * Get CSS class for the current status
   */
  get statusClass(): string {
    return `status-${this.status}`;
  }
}
