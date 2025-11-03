import { Component } from '@angular/core';

/**
 * Itinerary View Component
 * Page for viewing and managing itinerary items
 * This is a placeholder component that will be fully implemented later
 */
@Component({
  selector: 'app-itinerary-view',
  standalone: true,
  imports: [],
  template: `
    <div class="itinerary-container">
      <h2>Itinerary View</h2>
      <p>This page will display your trip itinerary with all travel details.</p>
      <p class="placeholder-note">
        <em>This page is under construction and will be fully implemented in the next phase.</em>
      </p>
    </div>
  `,
  styles: [
    `
      .itinerary-container {
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
export class ItineraryViewComponent {}
