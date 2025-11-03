import { Routes } from '@angular/router';

/**
 * Itinerary feature routes
 * Placeholder for future itinerary management pages
 */
export const ITINERARY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/itinerary-view/itinerary-view.component').then(
        (m) => m.ItineraryViewComponent,
      ),
  },
];
