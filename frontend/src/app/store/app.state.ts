import { Trip } from '../core/models/trip.model';
import { Flight } from '../core/models/flight.model';
import { Transport } from '../core/models/transport.model';
import { Accommodation } from '../core/models/accommodation.model';

/**
 * Union type for all itinerary item types
 */
export type ItineraryItem = Flight | Transport | Accommodation;

/**
 * Root application state interface
 * Defines the structure of the entire application state
 */

/**
 * Trips feature state
 * Manages the collection of trips and trip selection
 */
export interface TripsState {
  trips: Trip[];
  selectedTripId: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Itinerary feature state
 * Manages itinerary items and gap detection for the current trip
 */
export interface ItineraryState {
  items: ItineraryItem[];
  gaps: ItineraryGap[];
  selectedItemId: string | null;
  loading: boolean;
  error: string | null;
  dragInProgress: boolean;
}

/**
 * Gap detection interface
 * Represents a detected gap in the itinerary
 */
export interface ItineraryGap {
  id: string;
  type: 'time' | 'location' | 'accommodation';
  startItem: ItineraryItem;
  endItem: ItineraryItem;
  gapDuration: number; // minutes
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestions?: string[];
}

/**
 * UI feature state
 * Manages application-wide UI state
 */
export interface UIState {
  sidenavOpen: boolean;
  theme: 'light' | 'dark';
  mapView: boolean;
}

/**
 * Root application state
 * Combines all feature states
 *
 * Note: Feature states are commented out until the corresponding
 * feature stores are implemented. Uncomment as features are added.
 */
export interface AppState {
  // Feature states will be added as they are implemented
  // trips: TripsState;
  // itinerary: ItineraryState;
  // ui: UIState;
}

/**
 * Initial state for the application
 * Used when the store is first initialized
 */
export const initialAppState: AppState = {};
