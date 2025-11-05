import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItineraryItemComponent } from './itinerary-item.component';
import { Flight } from '../../../../core/models/flight.model';
import { Transport } from '../../../../core/models/transport.model';
import { Accommodation } from '../../../../core/models/accommodation.model';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

type ItineraryItem = Flight | Transport | Accommodation;

describe('ItineraryItemComponent', () => {
  let component: ItineraryItemComponent;
  let fixture: ComponentFixture<ItineraryItemComponent>;

  // Mock data - using actual class instances with getDuration methods
  const mockFlight = new Flight({
    id: '1',
    tripId: 'trip-1',
    type: 'flight',
    title: 'Flight to JFK',
    startDate: new Date('2024-01-15T10:00:00'),
    endDate: new Date('2024-01-15T14:00:00'),
    orderIndex: 1,
    flightNumber: 'AA123',
    airline: 'American Airlines',
    confirmationCode: 'ABC123',
    departureLocation: {
      address: 'Los Angeles International Airport',
      city: 'Los Angeles',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437,
    },
    arrivalLocation: {
      address: 'John F. Kennedy International Airport',
      city: 'New York',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.006,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

  const mockTransport = new Transport({
    id: '2',
    tripId: 'trip-1',
    type: 'transport',
    title: 'Train to Brussels',
    startDate: new Date('2024-01-16T08:00:00'),
    endDate: new Date('2024-01-16T10:30:00'),
    orderIndex: 2,
    transportType: 'train',
    provider: 'Eurostar',
    confirmationCode: 'XYZ789',
    departureLocation: {
      address: 'Gare du Nord',
      city: 'Paris',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
    },
    arrivalLocation: {
      address: 'Brussels Central Station',
      city: 'Brussels',
      country: 'Belgium',
      latitude: 50.8503,
      longitude: 4.3517,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

  const mockAccommodation = new Accommodation({
    id: '3',
    tripId: 'trip-1',
    type: 'accommodation',
    title: 'Hotel California',
    startDate: new Date('2024-01-17T15:00:00'),
    endDate: new Date('2024-01-20T11:00:00'),
    orderIndex: 3,
    name: 'Hotel California',
    confirmationNumber: 'HOTEL123',
    location: {
      address: '123 Sunset Blvd',
      city: 'Los Angeles',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraryItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItineraryItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.item = mockFlight;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Type Guards', () => {
    it('should identify flight correctly', () => {
      component.item = mockFlight;
      expect(component.isFlight(mockFlight)).toBe(true);
      expect(component.isTransport(mockFlight)).toBe(false);
      expect(component.isAccommodation(mockFlight)).toBe(false);
    });

    it('should identify transport correctly', () => {
      component.item = mockTransport;
      expect(component.isFlight(mockTransport)).toBe(false);
      expect(component.isTransport(mockTransport)).toBe(true);
      expect(component.isAccommodation(mockTransport)).toBe(false);
    });

    it('should identify accommodation correctly', () => {
      component.item = mockAccommodation;
      expect(component.isFlight(mockAccommodation)).toBe(false);
      expect(component.isTransport(mockAccommodation)).toBe(false);
      expect(component.isAccommodation(mockAccommodation)).toBe(true);
    });
  });

  describe('Type Casting', () => {
    it('should cast to Flight type', () => {
      const flight = component.asFlight(mockFlight);
      expect(flight.flightNumber).toBe('AA123');
      expect(flight.airline).toBe('American Airlines');
    });

    it('should cast to Transport type', () => {
      const transport = component.asTransport(mockTransport);
      expect(transport.transportType).toBe('train');
      expect(transport.provider).toBe('Eurostar');
    });

    it('should cast to Accommodation type', () => {
      const accommodation = component.asAccommodation(mockAccommodation);
      expect(accommodation.name).toBe('Hotel California');
    });
  });

  describe('CSS Classes', () => {
    it('should return correct class for flight', () => {
      component.item = mockFlight;
      expect(component.getItemTypeClass()).toBe('item-type-flight');
    });

    it('should return correct class for transport', () => {
      component.item = mockTransport;
      expect(component.getItemTypeClass()).toBe('item-type-transport');
    });

    it('should return correct class for accommodation', () => {
      component.item = mockAccommodation;
      expect(component.getItemTypeClass()).toBe('item-type-accommodation');
    });
  });

  describe('Icons', () => {
    it('should return flight icon', () => {
      component.item = mockFlight;
      expect(component.getItemIcon()).toBe('✈️');
    });

    it('should return transport icon', () => {
      component.item = mockTransport;
      expect(component.getItemIcon()).toBe('🚗');
    });

    it('should return accommodation icon', () => {
      component.item = mockAccommodation;
      expect(component.getItemIcon()).toBe('🏨');
    });

    it('should return default icon for unknown type', () => {
      const unknownItem = { ...mockFlight, type: 'unknown' } as unknown as ItineraryItem;
      component.item = unknownItem;
      expect(component.getItemIcon()).toBe('📍');
    });
  });

  describe('Type Labels', () => {
    it('should return "Flight" for flight type', () => {
      component.item = mockFlight;
      expect(component.getItemTypeLabel()).toBe('Flight');
    });

    it('should return "Transport" for transport type', () => {
      component.item = mockTransport;
      expect(component.getItemTypeLabel()).toBe('Transport');
    });

    it('should return "Accommodation" for accommodation type', () => {
      component.item = mockAccommodation;
      expect(component.getItemTypeLabel()).toBe('Accommodation');
    });

    it('should return "Item" for unknown type', () => {
      const unknownItem = { ...mockFlight, type: 'unknown' } as unknown as ItineraryItem;
      component.item = unknownItem;
      expect(component.getItemTypeLabel()).toBe('Item');
    });
  });

  describe('DateTime Formatting', () => {
    it('should format Date object correctly', () => {
      const date = new Date('2024-12-01T14:30:00');
      const formatted = component.formatDateTime(date);
      expect(formatted).toContain('Dec');
      expect(formatted).toContain('1');
      expect(formatted).toContain('2:30');
    });

    it('should format date string correctly', () => {
      const formatted = component.formatDateTime('2024-12-01T09:00:00');
      expect(formatted).toContain('Dec');
      expect(formatted).toContain('1');
      expect(formatted).toContain('9:00');
      expect(formatted).toContain('AM');
    });

    it('should format time only from Date object', () => {
      const date = new Date('2024-12-01T16:45:00');
      const formatted = component.formatTime(date);
      expect(formatted).toContain('4:45');
      expect(formatted).toContain('PM');
    });

    it('should format time only from string', () => {
      const formatted = component.formatTime('2024-12-01T08:15:00');
      expect(formatted).toContain('8:15');
      expect(formatted).toContain('AM');
    });
  });

  describe('Duration Formatting', () => {
    it('should format hours only', () => {
      expect(component.formatDuration(120)).toBe('2h');
    });

    it('should format minutes only', () => {
      expect(component.formatDuration(45)).toBe('45m');
    });

    it('should format hours and minutes', () => {
      expect(component.formatDuration(150)).toBe('2h 30m');
    });

    it('should handle zero duration', () => {
      expect(component.formatDuration(0)).toBe('0m');
    });

    it('should handle single hour', () => {
      expect(component.formatDuration(60)).toBe('1h');
    });
  });

  describe('Location Formatting', () => {
    it('should format with city and country', () => {
      const location = {
        address: '123 Main St',
        city: 'Los Angeles',
        country: 'USA',
      };
      expect(component.formatLocation(location)).toBe('Los Angeles, USA');
    });

    it('should format with city only', () => {
      const location = {
        address: '123 Main St',
        city: 'Paris',
      };
      expect(component.formatLocation(location)).toBe('Paris');
    });

    it('should format with address only', () => {
      const location = {
        address: '123 Main St',
      };
      expect(component.formatLocation(location)).toBe('123 Main St');
    });

    it('should handle missing optional fields', () => {
      const location = {
        address: 'Airport',
        city: undefined,
        country: undefined,
      };
      expect(component.formatLocation(location)).toBe('Airport');
    });
  });

  describe('Label Variations', () => {
    it('should return "Departure" for flight', () => {
      component.item = mockFlight;
      expect(component.getDepartureLabel()).toBe('Departure');
    });

    it('should return "Departure" for transport', () => {
      component.item = mockTransport;
      expect(component.getDepartureLabel()).toBe('Departure');
    });

    it('should return "Check-in" for accommodation', () => {
      component.item = mockAccommodation;
      expect(component.getDepartureLabel()).toBe('Check-in');
    });

    it('should return "Arrival" for flight', () => {
      component.item = mockFlight;
      expect(component.getArrivalLabel()).toBe('Arrival');
    });

    it('should return "Arrival" for transport', () => {
      component.item = mockTransport;
      expect(component.getArrivalLabel()).toBe('Arrival');
    });

    it('should return "Check-out" for accommodation', () => {
      component.item = mockAccommodation;
      expect(component.getArrivalLabel()).toBe('Check-out');
    });
  });

  describe('Event Emissions', () => {
    it('should emit edit event when onEdit is called', () => {
      component.item = mockFlight;
      const editSpy = jasmine.createSpy('editSpy');
      component.edit.subscribe(editSpy);

      component.onEdit();

      expect(editSpy).toHaveBeenCalledWith(mockFlight);
    });

    it('should emit delete event when onDelete is called', () => {
      component.item = mockTransport;
      const deleteSpy = jasmine.createSpy('deleteSpy');
      component.delete.subscribe(deleteSpy);

      component.onDelete();

      expect(deleteSpy).toHaveBeenCalledWith(mockTransport);
    });

    it('should emit correct item on edit', () => {
      component.item = mockAccommodation;
      const editSpy = jasmine.createSpy('editSpy');
      component.edit.subscribe(editSpy);

      component.onEdit();

      expect(editSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: '3',
          type: 'accommodation',
        }),
      );
    });
  });

  describe('Integration Tests', () => {
    it('should correctly display flight information', () => {
      component.item = mockFlight;
      fixture.detectChanges();

      expect(component.getItemTypeLabel()).toBe('Flight');
      expect(component.getItemIcon()).toBe('✈️');
      expect(component.isFlight(component.item)).toBe(true);
    });

    it('should correctly display transport information', () => {
      component.item = mockTransport;
      fixture.detectChanges();

      expect(component.getItemTypeLabel()).toBe('Transport');
      expect(component.getItemIcon()).toBe('🚗');
      expect(component.isTransport(component.item)).toBe(true);
    });

    it('should correctly display accommodation information', () => {
      component.item = mockAccommodation;
      fixture.detectChanges();

      expect(component.getItemTypeLabel()).toBe('Accommodation');
      expect(component.getItemIcon()).toBe('🏨');
      expect(component.isAccommodation(component.item)).toBe(true);
      expect(component.getDepartureLabel()).toBe('Check-in');
      expect(component.getArrivalLabel()).toBe('Check-out');
    });
  });
});
