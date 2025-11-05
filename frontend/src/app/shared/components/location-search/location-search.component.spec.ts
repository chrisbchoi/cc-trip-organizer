import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LocationSearchComponent } from './location-search.component';
import { Location } from '../../../core/models/location.model';

describe('LocationSearchComponent', () => {
  let component: LocationSearchComponent;
  let fixture: ComponentFixture<LocationSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationSearchComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty search control', () => {
      expect(component.searchControl.value).toBe('');
    });

    it('should initialize loading signal as false', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('should initialize showSuggestions signal as false', () => {
      expect(component.showSuggestions()).toBe(false);
    });

    it('should initialize suggestions signal as empty array', () => {
      expect(component.suggestions()).toEqual([]);
    });

    it('should initialize errorMessage signal as null', () => {
      expect(component.errorMessage()).toBeNull();
    });

    it('should initialize selectedLocation as null', () => {
      expect(component.selectedLocation).toBeNull();
    });

    it('should initialize disabled as false', () => {
      expect(component.disabled).toBe(false);
    });
  });

  describe('Search Input', () => {
    it('should not search for queries shorter than 3 characters', fakeAsync(() => {
      component.searchControl.setValue('ab');
      tick(300);

      expect(component.isLoading()).toBe(false);
      expect(component.suggestions()).toEqual([]);
    }));

    it('should trigger search for queries 3 characters or longer', fakeAsync(() => {
      component.searchControl.setValue('New');
      tick(300);
      tick(500); // Mock API delay

      expect(component.suggestions().length).toBeGreaterThan(0);
    }));

    it('should debounce search input by 300ms', fakeAsync(() => {
      component.searchControl.setValue('N');
      tick(100);
      component.searchControl.setValue('Ne');
      tick(100);
      component.searchControl.setValue('New');
      tick(100); // Only 100ms passed, not enough

      expect(component.isLoading()).toBe(false);

      tick(200); // Now total 300ms passed
      expect(component.isLoading()).toBe(true);
    }));

    it('should clear suggestions when query is too short', fakeAsync(() => {
      component.searchControl.setValue('New York');
      tick(300);
      tick(500);

      expect(component.suggestions().length).toBeGreaterThan(0);

      component.searchControl.setValue('Ne');
      tick(300);

      expect(component.suggestions()).toEqual([]);
      expect(component.showSuggestions()).toBe(false);
    }));

    it('should not trigger duplicate searches for same query', fakeAsync(() => {
      const spy = spyOn(
        component as unknown as { performGeocode: () => void },
        'performGeocode',
      ).and.callThrough();

      component.searchControl.setValue('Paris');
      tick(300);
      tick(500);

      component.searchControl.setValue('Paris');
      tick(300);

      expect(spy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('Geocoding Search', () => {
    it('should set loading state during search', fakeAsync(() => {
      component.searchControl.setValue('London');
      tick(300);

      expect(component.isLoading()).toBe(true);

      tick(500);

      expect(component.isLoading()).toBe(false);
    }));

    it('should generate mock location results', fakeAsync(() => {
      component.searchControl.setValue('Test');
      tick(300);
      tick(500);

      const suggestions = component.suggestions();
      expect(suggestions.length).toBe(3);
      expect(suggestions[0].city).toBe('New York');
      expect(suggestions[1].city).toBe('Los Angeles');
      expect(suggestions[2].city).toBe('Chicago');
    }));

    it('should include query in generated results', fakeAsync(() => {
      component.searchControl.setValue('Main');
      tick(300);
      tick(500);

      const suggestions = component.suggestions();
      suggestions.forEach((loc) => {
        expect(loc.address).toContain('Main');
      });
    }));

    it('should show suggestions when results are found', fakeAsync(() => {
      component.searchControl.setValue('Paris');
      tick(300);
      tick(500);

      expect(component.showSuggestions()).toBe(true);
    }));

    it('should clear error message on successful search', fakeAsync(() => {
      component.errorMessage.set('Previous error');

      component.searchControl.setValue('Berlin');
      tick(300);
      tick(500);

      expect(component.errorMessage()).toBeNull();
    }));

    it('should generate unique place IDs', fakeAsync(() => {
      component.searchControl.setValue('City');
      tick(300);
      tick(500);

      const suggestions = component.suggestions();
      const placeIds = suggestions.map((s) => s.placeId);
      const uniquePlaceIds = new Set(placeIds);

      expect(uniquePlaceIds.size).toBe(placeIds.length);
    }));
  });

  describe('Suggestion Selection', () => {
    it('should set selected location when suggestion is clicked', fakeAsync(() => {
      component.searchControl.setValue('Test');
      tick(300);
      tick(500);

      const firstSuggestion = component.suggestions()[0];
      component.selectSuggestion(firstSuggestion);

      expect(component.selectedLocation).toEqual(firstSuggestion);
    }));

    it('should update search control with selected location address', fakeAsync(() => {
      component.searchControl.setValue('Test');
      tick(300);
      tick(500);

      const firstSuggestion = component.suggestions()[0];
      component.selectSuggestion(firstSuggestion);

      expect(component.searchControl.value).toBe(
        firstSuggestion.formattedAddress || firstSuggestion.address,
      );
    }));

    it('should hide suggestions after selection', fakeAsync(() => {
      component.searchControl.setValue('Test');
      tick(300);
      tick(500);

      const firstSuggestion = component.suggestions()[0];
      component.selectSuggestion(firstSuggestion);

      expect(component.showSuggestions()).toBe(false);
    }));

    it('should emit selected location via onChange', fakeAsync(() => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.searchControl.setValue('Test');
      tick(300);
      tick(500);

      const firstSuggestion = component.suggestions()[0];
      component.selectSuggestion(firstSuggestion);

      expect(onChangeSpy).toHaveBeenCalledWith(firstSuggestion);
    }));

    it('should call onTouched when suggestion is selected', fakeAsync(() => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      component.searchControl.setValue('Test');
      tick(300);
      tick(500);

      const firstSuggestion = component.suggestions()[0];
      component.selectSuggestion(firstSuggestion);

      expect(onTouchedSpy).toHaveBeenCalled();
    }));
  });

  describe('Clear Selection', () => {
    it('should clear selected location', () => {
      component.selectedLocation = { address: 'Test' } as Location;

      component.clearSelection();

      expect(component.selectedLocation).toBeNull();
    });

    it('should clear search control value', () => {
      component.searchControl.setValue('Test Address');

      component.clearSelection();

      expect(component.searchControl.value).toBe('');
    });

    it('should clear suggestions', () => {
      component.suggestions.set([{ address: 'Test' } as Location]);

      component.clearSelection();

      expect(component.suggestions()).toEqual([]);
    });

    it('should hide suggestions', () => {
      component.showSuggestions.set(true);

      component.clearSelection();

      expect(component.showSuggestions()).toBe(false);
    });

    it('should emit null via onChange', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      component.clearSelection();

      expect(onChangeSpy).toHaveBeenCalledWith(null);
    });

    it('should call onTouched', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      component.clearSelection();

      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Focus and Blur Handling', () => {
    it('should show suggestions on focus if suggestions exist', () => {
      component.suggestions.set([{ address: 'Test' } as Location]);
      component.showSuggestions.set(false);

      component.onFocus();

      expect(component.showSuggestions()).toBe(true);
    });

    it('should not show suggestions on focus if no suggestions', () => {
      component.suggestions.set([]);

      component.onFocus();

      expect(component.showSuggestions()).toBe(false);
    });

    it('should call onTouched on blur', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      component.onBlur();

      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should hide suggestions on blur with delay', fakeAsync(() => {
      component.showSuggestions.set(true);

      component.onBlur();

      expect(component.showSuggestions()).toBe(true); // Still visible immediately

      tick(200);

      expect(component.showSuggestions()).toBe(false); // Hidden after delay
    }));
  });

  describe('ControlValueAccessor - writeValue', () => {
    it('should write location to search control', () => {
      const testLocation: Location = {
        address: '123 Main St',
        formattedAddress: '123 Main St, New York, NY',
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.006,
      };

      component.writeValue(testLocation);

      expect(component.selectedLocation).toEqual(testLocation);
      expect(component.searchControl.value).toBe('123 Main St, New York, NY');
    });

    it('should use address if formattedAddress is not available', () => {
      const testLocation: Location = {
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.006,
      };

      component.writeValue(testLocation);

      expect(component.searchControl.value).toBe('123 Main St');
    });

    it('should clear control when writing null', () => {
      component.searchControl.setValue('Test');

      component.writeValue(null);

      expect(component.selectedLocation).toBeNull();
      expect(component.searchControl.value).toBe('');
    });

    it('should not trigger valueChanges when writing value', fakeAsync(() => {
      const spy = spyOn(component as unknown as { performGeocode: () => void }, 'performGeocode');

      const testLocation: Location = {
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.006,
      };

      component.writeValue(testLocation);
      tick(300);

      expect(spy).not.toHaveBeenCalled();
    }));
  });

  describe('ControlValueAccessor - setDisabledState', () => {
    it('should disable search control when disabled', () => {
      component.setDisabledState(true);

      expect(component.disabled).toBe(true);
      expect(component.searchControl.disabled).toBe(true);
    });

    it('should enable search control when not disabled', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);

      expect(component.disabled).toBe(false);
      expect(component.searchControl.disabled).toBe(false);
    });
  });

  describe('Display Methods', () => {
    it('should return formatted address for location display', () => {
      const location: Location = {
        address: '123 Main St',
        formattedAddress: '123 Main St, Paris, France',
        city: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
      };

      const display = component.getLocationDisplayText(location);

      expect(display).toBe('123 Main St, Paris, France');
    });

    it('should return address if formatted address not available', () => {
      const location: Location = {
        address: '123 Main St',
        city: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
      };

      const display = component.getLocationDisplayText(location);

      expect(display).toBe('123 Main St');
    });

    it('should return city and country details', () => {
      const location: Location = {
        address: '123 Main St',
        city: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
      };

      const details = component.getLocationDetails(location);

      expect(details).toBe('Paris, France');
    });

    it('should return only city if country not available', () => {
      const location: Location = {
        address: '123 Main St',
        city: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
      };

      const details = component.getLocationDetails(location);

      expect(details).toBe('Paris');
    });

    it('should return empty string if neither city nor country available', () => {
      const location: Location = {
        address: '123 Main St',
        latitude: 48.8566,
        longitude: 2.3522,
      };

      const details = component.getLocationDetails(location);

      expect(details).toBe('');
    });
  });

  describe('Component Cleanup', () => {
    it('should complete destroy$ subject on destroy', () => {
      const destroySpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(LocationSearchComponent).toBeDefined();
    });
  });
});
