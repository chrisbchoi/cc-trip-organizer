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
  itemId = signal<string | null>(null);
  selectedType = signal<ItemType>(null);
  existingItem = signal<any>(null);
  isEditMode = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed property to check if a type is selected
  hasSelectedType = computed(() => this.selectedType() !== null);
  
  // Computed property for page title
  pageTitle = computed(() => 
    this.isEditMode() ? 'Edit Itinerary Item' : 'Add Item to Itinerary'
  );

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
    // Get trip ID and item ID from route parameters
    this.route.paramMap.subscribe((params) => {
      const tripIdParam = params.get('tripId');
      const itemIdParam = params.get('itemId');
      
      this.tripId.set(tripIdParam);
      this.itemId.set(itemIdParam);
      
      if (!tripIdParam) {
        this.error.set('No trip ID provided');
      }
      
      // If item ID exists, we're in edit mode
      if (itemIdParam) {
        this.isEditMode.set(true);
        this.loadExistingItem(itemIdParam);
      }
    });

    // Check if type is pre-selected via query params
    this.route.queryParamMap.subscribe((queryParams) => {
      const type = queryParams.get('type') as ItemType;
      if (type && ['flight', 'transport', 'accommodation'].includes(type)) {
        this.selectedType.set(type);
      }
    });
  }
  
  /**
   * Load existing item data for edit mode
   */
  private loadExistingItem(itemId: string): void {
    // TODO: Load item from store or API
    // For now, we'll simulate loading with mock data
    // In a real implementation, you would:
    // 1. Check the store first
    // 2. If not in store, fetch from API
    // 3. Set existingItem and selectedType based on loaded data
    
    console.log('Loading item for edit:', itemId);
    
    // Example: this.store.select(selectItemById(itemId)).subscribe(item => {
    //   if (item) {
    //     this.existingItem.set(item);
    //     this.selectedType.set(item.type);
    //   }
    // });
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
  
  /**
   * Get action label (Add vs Edit)
   */
  getActionLabel(): string {
    return this.isEditMode() ? 'Edit' : 'Add';
  }
}
