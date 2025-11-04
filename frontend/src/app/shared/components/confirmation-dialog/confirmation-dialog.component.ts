import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Confirmation dialog component for yes/no confirmations
 * Standalone component with built-in accessibility support
 */
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
  /**
   * Whether the dialog is currently open
   */
  @Input() isOpen = false;

  /**
   * Title text displayed at the top of the dialog
   */
  @Input() title = 'Confirm Action';

  /**
   * Message text displayed in the dialog body
   */
  @Input() message = 'Are you sure you want to proceed?';

  /**
   * Text for the confirm button
   */
  @Input() confirmText = 'Confirm';

  /**
   * Text for the cancel button
   */
  @Input() cancelText = 'Cancel';

  /**
   * Whether the confirm action is dangerous (uses warn color)
   */
  @Input() isDangerous = false;

  /**
   * Emitted when user confirms the action
   */
  @Output() confirmed = new EventEmitter<void>();

  /**
   * Emitted when user cancels or closes the dialog
   */
  @Output() cancelled = new EventEmitter<void>();

  /**
   * Handle confirm button click
   */
  onConfirm(): void {
    this.confirmed.emit();
    this.isOpen = false;
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.cancelled.emit();
    this.isOpen = false;
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(): void {
    this.onCancel();
  }

  /**
   * Handle escape key press
   */
  onEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onCancel();
    }
  }

  /**
   * Prevent dialog content click from closing dialog
   */
  onDialogClick(event: Event): void {
    event.stopPropagation();
  }
}
