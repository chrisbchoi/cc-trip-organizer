import { Routes } from '@angular/router';

/**
 * Application routes configuration
 * Features are lazy-loaded for better performance
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'trips',
  },
  {
    path: 'trips',
    loadChildren: () =>
      import('./features/trips/trips.routes').then((m) => m.TRIPS_ROUTES),
  },
  {
    path: 'itinerary',
    loadChildren: () =>
      import('./features/itinerary/itinerary.routes').then((m) => m.ITINERARY_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'trips',
  },
];
