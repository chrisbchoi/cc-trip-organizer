import { Component } from '@angular/core';

/**
 * Trips Dashboard Component
 * Main page for viewing and managing trips
 * This is a placeholder component that will be fully implemented later
 */
@Component({
  selector: 'app-trips-dashboard',
  standalone: true,
  imports: [],
  template: `
    <div class="dashboard-container">
      <h2>Trips Dashboard</h2>
      <p>Welcome to the Trip Organizer! This is where you'll manage your trips.</p>
      <p class="placeholder-note">
        <em>This page is under construction and will be fully implemented in the next phase.</em>
      </p>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      h2 {
        color: #1976d2;
        margin-top: 0;
      }

      .placeholder-note {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 4px;
        color: #856404;
      }
    `,
  ],
})
export class TripsDashboardComponent {}
