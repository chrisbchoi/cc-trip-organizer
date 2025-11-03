import { Routes } from '@angular/router';

/**
 * Trips feature routes
 * Placeholder for future trip management pages
 */
export const TRIPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/trips-dashboard/trips-dashboard.component').then(
        (m) => m.TripsDashboardComponent,
      ),
  },
];
