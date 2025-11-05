import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryViewComponent } from './itinerary-view.component';

describe('ItineraryViewComponent', () => {
  let component: ItineraryViewComponent;
  let fixture: ComponentFixture<ItineraryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraryViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItineraryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have a fixture', () => {
      expect(fixture).toBeTruthy();
    });
  });

  describe('Template Rendering', () => {
    it('should display the page title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const heading = compiled.querySelector('h2');
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toContain('Itinerary View');
    });

    it('should display the main description', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const paragraphs = compiled.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThan(0);
      expect(paragraphs[0]?.textContent).toContain(
        'This page will display your trip itinerary with all travel details.',
      );
    });

    it('should display the placeholder note', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const placeholder = compiled.querySelector('.placeholder-note');
      expect(placeholder).toBeTruthy();
      expect(placeholder?.textContent).toContain('under construction');
    });

    it('should have a container with proper styling', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.itinerary-container');
      expect(container).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(ItineraryViewComponent).toBeDefined();
    });
  });
});
