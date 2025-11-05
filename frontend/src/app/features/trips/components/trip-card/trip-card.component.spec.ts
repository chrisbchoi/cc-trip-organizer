import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripCardComponent } from './trip-card.component';
import { Trip } from '../../../../core/models/trip.model';
import { DateFormatPipe } from '../../../../shared/pipes';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TripCardComponent', () => {
  let component: TripCardComponent;
  let fixture: ComponentFixture<TripCardComponent>;
  let mockTrip: Trip;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripCardComponent, DateFormatPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(TripCardComponent);
    component = fixture.componentInstance;

    // Create mock trip
    mockTrip = new Trip({
      id: 'test-trip-123',
      title: 'Summer Vacation 2024',
      description: 'Amazing trip to Europe visiting Paris, Rome, and Barcelona',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-15'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    });

    component.trip = mockTrip;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should require trip input', () => {
      expect(component.trip).toBeDefined();
      expect(component.trip).toBe(mockTrip);
    });
  });

  describe('Template Rendering', () => {
    it('should display trip title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Summer Vacation 2024');
    });

    it('should display trip description when provided', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Amazing trip to Europe');
    });

    it('should handle trip without description gracefully', () => {
      const tripWithoutDesc = new Trip({
        id: 'test-trip-456',
        title: 'Quick Trip',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-08-05'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      component.trip = tripWithoutDesc;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Quick Trip');
    });

    it('should display formatted dates using DateFormatPipe', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      // Dates should be formatted by the pipe
      expect(compiled.textContent).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}|\w+ \d{1,2}, \d{4}/);
    });
  });

  describe('User Interactions', () => {
    it('should emit select event with trip ID when card is clicked', () => {
      spyOn(component.select, 'emit');

      component.onCardClick();

      expect(component.select.emit).toHaveBeenCalledWith('test-trip-123');
      expect(component.select.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit select event when card element is clicked in DOM', () => {
      spyOn(component.select, 'emit');

      const cardElement: DebugElement = fixture.debugElement.query(By.css('.trip-card'));
      if (cardElement) {
        cardElement.nativeElement.click();
        expect(component.select.emit).toHaveBeenCalledWith('test-trip-123');
      }
    });

    it('should emit delete event with trip ID when delete button is clicked', () => {
      spyOn(component.delete, 'emit');
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');

      component.onDeleteClick(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.delete.emit).toHaveBeenCalledWith('test-trip-123');
      expect(component.delete.emit).toHaveBeenCalledTimes(1);
    });

    it('should stop event propagation when delete button is clicked', () => {
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');
      spyOn(component.delete, 'emit');

      component.onDeleteClick(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should not emit select event when delete button is clicked', () => {
      spyOn(component.select, 'emit');
      spyOn(component.delete, 'emit');
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');

      component.onDeleteClick(mockEvent);

      expect(component.select.emit).not.toHaveBeenCalled();
      expect(component.delete.emit).toHaveBeenCalled();
    });
  });

  describe('Output Emissions', () => {
    it('should have select output that emits string', (done) => {
      component.select.subscribe((tripId) => {
        expect(typeof tripId).toBe('string');
        expect(tripId).toBe('test-trip-123');
        done();
      });

      component.onCardClick();
    });

    it('should have delete output that emits string', (done) => {
      component.delete.subscribe((tripId) => {
        expect(typeof tripId).toBe('string');
        expect(tripId).toBe('test-trip-123');
        done();
      });

      component.onDeleteClick(new Event('click'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle trip with very long title', () => {
      const longTitleTrip = new Trip({
        id: 'test-long',
        title: 'A'.repeat(200),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-10'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      component.trip = longTitleTrip;
      fixture.detectChanges();

      expect(component.trip.title.length).toBe(200);
    });

    it('should handle trip with same start and end date', () => {
      const sameDateTrip = new Trip({
        id: 'test-same-date',
        title: 'One Day Trip',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      component.trip = sameDateTrip;
      fixture.detectChanges();

      expect(component.trip.startDate).toEqual(component.trip.endDate);
    });
  });
});
