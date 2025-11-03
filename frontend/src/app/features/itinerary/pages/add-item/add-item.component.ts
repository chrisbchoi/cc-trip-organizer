import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { FlightFormComponent } from '../../components/flight-form/flight-form.component';
import { TransportFormComponent } from '../../components/transport-form/transport-form.component';
import { AccommodationFormComponent } from '../../components/accommodation-form/accommodation-form.component';

type ItemType = 'flight' | 'transport' | 'accommodation' | null;

interface ItemTypeOption {
  value: ItemType;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FlightFormComponent,
    TransportFormComponent,
    AccommodationFormComponent
  ],
  templateUrl: './add-item.component.html',
  styleUrl: './add-item.component.scss'
})
export class AddItemComponent implements OnInit {
  tripId = signal<string | null>(null);
  selectedType = signal<ItemType>(null);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed property to check if a type is selected
  hasSelectedType = computed(() => this.selectedType() !== null);

  // Available item types
  itemTypes: ItemTypeOption[] = [
    {
      value: 'flight',
      label: 'Flight',
      icon: '✈️',
      description: 'Add a flight to your itinerary'
    },
    {
      value: 'transport',
      label: 'Transport',
      icon: '🚗',
      description: 'Add ground transportation (train, bus, car, etc.)'
    },
    {
      value: 'accommodation',
      label: 'Accommodation',
      icon: '🏨',
      description: 'Add hotel or lodging'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get trip ID from route parameters
    this.route.paramMap.subscribe(params => {
      const id = params.get('tripId');
      this.tripId.set(id);
      
      if (!id) {
        this.error.set('No trip ID provided');
      }
    });

    // Check if type is pre-selected via query params
    this.route.queryParamMap.subscribe(queryParams => {
      const type = queryParams.get('type') as ItemType;
      if (type && ['flight', 'transport', 'accommodation'].includes(type)) {
        this.selectedType.set(type);
      }
    });
  }

  /**
   * Handle item type selection
   */
  selectType(type: ItemType): void {
    this.selectedType.set(type);
    this.error.set(null);
  }

  /**
   * Handle flight form submission
   */
  onFlightSubmit(_flight: unknown): void {
    this.navigateBack();
  }

  /**
   * Handle transport form submission
   */
  onTransportSubmit(_transport: unknown): void {
    this.navigateBack();
  }

  /**
   * Handle accommodation form submission
   */
  onAccommodationSubmit(_accommodation: unknown): void {
    this.navigateBack();
  }

  /**
   * Handle form cancellation
   */
  onFormCancel(): void {
    this.navigateBack();
  }

  /**
   * Navigate back to trip detail page
   */
  private navigateBack(): void {
    const tripId = this.tripId();
    if (tripId) {
      this.router.navigate(['/trips', tripId]);
    } else {
      this.router.navigate(['/trips']);
    }
  }

  /**
   * Cancel and return to trip detail
   */
  cancel(): void {
    const tripId = this.tripId();
    if (tripId) {
      this.router.navigate(['/trips', tripId]);
    } else {
      this.router.navigate(['/trips']);
    }
  }

  /**
   * Reset type selection to go back to selector
   */
  backToSelector(): void {
    this.selectedType.set(null);
    this.error.set(null);
  }

  /**
   * Get display label for selected type
   */
  getSelectedTypeLabel(): string {
    const type = this.selectedType();
    const option = this.itemTypes.find((t) => t.value === type);
    return option ? option.label : '';
  }
}
