import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GapIndicatorComponent } from './gap-indicator.component';
import { ItineraryGap } from '../../services/itinerary-api.service';

describe('GapIndicatorComponent', () => {
  let component: GapIndicatorComponent;
  let fixture: ComponentFixture<GapIndicatorComponent>;

  const createMockGap = (overrides: Partial<ItineraryGap> = {}): ItineraryGap => ({
    startDateTime: '2024-12-01T10:00:00',
    endDateTime: '2024-12-01T14:00:00',
    durationHours: 4,
    previousItem: undefined,
    nextItem: undefined,
    suggestion: undefined,
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GapIndicatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GapIndicatorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.gap = createMockGap();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Severity Calculation', () => {
    it('should return "info" for gaps less than 3 hours', () => {
      component.gap = createMockGap({ durationHours: 2 });
      expect(component.getSeverity()).toBe('info');
    });

    it('should return "warning" for gaps between 3 and 12 hours', () => {
      component.gap = createMockGap({ durationHours: 6 });
      expect(component.getSeverity()).toBe('warning');
    });

    it('should return "error" for gaps of 12 hours or more', () => {
      component.gap = createMockGap({ durationHours: 15 });
      expect(component.getSeverity()).toBe('error');
    });

    it('should return "warning" for gap at 3 hour boundary', () => {
      component.gap = createMockGap({ durationHours: 3 });
      expect(component.getSeverity()).toBe('warning');
    });

    it('should return "error" for gap at 12 hour boundary', () => {
      component.gap = createMockGap({ durationHours: 12 });
      expect(component.getSeverity()).toBe('error');
    });
  });

  describe('CSS Class Generation', () => {
    it('should return correct CSS class for info severity', () => {
      component.gap = createMockGap({ durationHours: 1 });
      expect(component.getSeverityClass()).toBe('gap-severity-info');
    });

    it('should return correct CSS class for warning severity', () => {
      component.gap = createMockGap({ durationHours: 5 });
      expect(component.getSeverityClass()).toBe('gap-severity-warning');
    });

    it('should return correct CSS class for error severity', () => {
      component.gap = createMockGap({ durationHours: 24 });
      expect(component.getSeverityClass()).toBe('gap-severity-error');
    });
  });

  describe('Icon Selection', () => {
    it('should return transport icon for transport suggestion', () => {
      component.gap = createMockGap({ suggestion: 'transport' });
      expect(component.getGapIcon()).toBe('🚗');
    });

    it('should return accommodation icon for accommodation suggestion', () => {
      component.gap = createMockGap({ suggestion: 'accommodation' });
      expect(component.getGapIcon()).toBe('🏨');
    });

    it('should return clock icon for no suggestion', () => {
      component.gap = createMockGap({ suggestion: undefined });
      expect(component.getGapIcon()).toBe('⏰');
    });
  });

  describe('Type Labels', () => {
    it('should return correct label for transport suggestion', () => {
      component.gap = createMockGap({ suggestion: 'transport' });
      expect(component.getGapTypeLabel()).toBe('Missing Transportation');
    });

    it('should return correct label for accommodation suggestion', () => {
      component.gap = createMockGap({ suggestion: 'accommodation' });
      expect(component.getGapTypeLabel()).toBe('Missing Accommodation');
    });

    it('should return generic label for no suggestion', () => {
      component.gap = createMockGap({ suggestion: undefined });
      expect(component.getGapTypeLabel()).toBe('Time Gap');
    });
  });

  describe('Duration Formatting', () => {
    it('should format duration with only hours when minutes are 0', () => {
      component.gap = createMockGap({ durationHours: 3 });
      expect(component.formatDuration()).toBe('3 hours');
    });

    it('should format duration with only minutes when hours are 0', () => {
      component.gap = createMockGap({ durationHours: 0.5 });
      expect(component.formatDuration()).toBe('30 minutes');
    });

    it('should format duration with both hours and minutes', () => {
      component.gap = createMockGap({ durationHours: 2.5 });
      expect(component.formatDuration()).toBe('2 hours 30 minutes');
    });

    it('should use singular form for 1 hour', () => {
      component.gap = createMockGap({ durationHours: 1 });
      expect(component.formatDuration()).toBe('1 hour');
    });

    it('should use singular form for 1 minute', () => {
      component.gap = createMockGap({ durationHours: 1 / 60 });
      expect(component.formatDuration()).toBe('1 minute');
    });

    it('should handle fractional hours correctly', () => {
      component.gap = createMockGap({ durationHours: 4.75 });
      expect(component.formatDuration()).toBe('4 hours 45 minutes');
    });
  });

  describe('DateTime Formatting', () => {
    it('should format datetime correctly', () => {
      component.gap = createMockGap({ startDateTime: '2024-12-01T14:30:00' });
      const formatted = component.formatDateTime('2024-12-01T14:30:00');
      expect(formatted).toContain('Dec');
      expect(formatted).toContain('1');
      expect(formatted).toContain('2:30');
    });

    it('should format datetime with AM/PM', () => {
      component.gap = createMockGap({ startDateTime: '2024-12-01T09:00:00' });
      const formatted = component.formatDateTime('2024-12-01T09:00:00');
      expect(formatted).toContain('AM');
    });
  });

  describe('Gap Messages', () => {
    it('should return urgent message for long transport gap', () => {
      component.gap = createMockGap({ durationHours: 15, suggestion: 'transport' });
      const message = component.getGapMessage();
      expect(message).toContain('15 hours');
      expect(message).toContain('without transportation');
      expect(message).toContain('may need to arrange travel');
    });

    it('should return casual message for short transport gap', () => {
      component.gap = createMockGap({ durationHours: 2, suggestion: 'transport' });
      const message = component.getGapMessage();
      expect(message).toContain('2 hours');
      expect(message).toContain('gap in your itinerary');
      expect(message).toContain('Consider adding transportation');
    });

    it('should return urgent message for long accommodation gap', () => {
      component.gap = createMockGap({ durationHours: 20, suggestion: 'accommodation' });
      const message = component.getGapMessage();
      expect(message).toContain('20 hours');
      expect(message).toContain('without accommodation');
      expect(message).toContain('may need to book lodging');
    });

    it('should return casual message for short accommodation gap', () => {
      component.gap = createMockGap({ durationHours: 5, suggestion: 'accommodation' });
      const message = component.getGapMessage();
      expect(message).toContain('5 hours');
      expect(message).toContain('gap in your itinerary');
      expect(message).toContain('Consider adding accommodation');
    });

    it('should return informational message for short generic gap', () => {
      component.gap = createMockGap({ durationHours: 1, suggestion: undefined });
      const message = component.getGapMessage();
      expect(message).toContain('1 hour');
      expect(message).toContain('may be intentional');
    });

    it('should return warning message for medium generic gap', () => {
      component.gap = createMockGap({ durationHours: 8, suggestion: undefined });
      const message = component.getGapMessage();
      expect(message).toContain('8 hours');
      expect(message).toContain('may want to fill this gap');
    });
  });

  describe('Suggestion Text', () => {
    it('should return suggestion text for transport', () => {
      component.gap = createMockGap({ suggestion: 'transport' });
      expect(component.getSuggestionText()).toBe('Add transportation to connect these locations');
    });

    it('should return suggestion text for accommodation', () => {
      component.gap = createMockGap({ suggestion: 'accommodation' });
      expect(component.getSuggestionText()).toBe('Add accommodation for overnight stay');
    });

    it('should return null for no suggestion', () => {
      component.gap = createMockGap({ suggestion: undefined });
      expect(component.getSuggestionText()).toBeNull();
    });
  });

  describe('Fill Gap Action', () => {
    it('should emit fillGap event when button is clicked', () => {
      const gap = createMockGap({ durationHours: 5 });
      component.gap = gap;

      const fillGapSpy = jasmine.createSpy('fillGapSpy');
      component.fillGap.subscribe(fillGapSpy);

      component.onFillGap();

      expect(fillGapSpy).toHaveBeenCalledWith(gap);
    });

    it('should emit the correct gap object', () => {
      const specificGap = createMockGap({
        durationHours: 10,
        suggestion: 'transport',
        startDateTime: '2024-12-01T10:00:00',
        endDateTime: '2024-12-01T20:00:00',
      });
      component.gap = specificGap;

      const fillGapSpy = jasmine.createSpy('fillGapSpy');
      component.fillGap.subscribe(fillGapSpy);

      component.onFillGap();

      expect(fillGapSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          durationHours: 10,
          suggestion: 'transport',
        }),
      );
    });
  });

  describe('Integration', () => {
    it('should calculate severity and display appropriate message', () => {
      component.gap = createMockGap({ durationHours: 18, suggestion: 'accommodation' });
      fixture.detectChanges();

      expect(component.getSeverity()).toBe('error');
      expect(component.getGapMessage()).toContain('without accommodation');
    });

    it('should handle edge cases gracefully', () => {
      component.gap = createMockGap({ durationHours: 0 });
      expect(component.formatDuration()).toContain('minute');
      expect(component.getSeverity()).toBe('info');
    });
  });
});
