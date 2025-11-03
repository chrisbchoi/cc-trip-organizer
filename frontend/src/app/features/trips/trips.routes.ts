import { Routes } from '@angular/router';

/**
 * Trips feature routes
 * Manages trip list, detail, and itinerary item management
 */
export const TRIPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/trips-dashboard/trips-dashboard.component').then(
        (m) => m.TripsDashboardComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/trip-detail/trip-detail.component').then((m) => m.TripDetailComponent),
  },
  {
    path: ':tripId/add-item',
    loadComponent: () =>
      import('../itinerary/pages/add-item/add-item.component').then((m) => m.AddItemComponent),
  },
  {
    path: ':tripId/edit-item/:itemId',
    loadComponent: () =>
      import('../itinerary/pages/add-item/add-item.component').then((m) => m.AddItemComponent),
  },
];
