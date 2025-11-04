import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Loading spinner component for displaying loading states
 * Standalone component with built-in accessibility support
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
})
export class LoadingSpinnerComponent {
  /**
   * Optional message to display below the spinner
   */
  message = 'Loading...';
}
