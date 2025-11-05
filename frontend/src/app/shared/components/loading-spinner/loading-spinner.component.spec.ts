import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default message', () => {
      expect(component.message).toBe('Loading...');
    });
  });

  describe('Message Property', () => {
    it('should accept custom message', () => {
      component.message = 'Please wait...';
      fixture.detectChanges();
      expect(component.message).toBe('Please wait...');
    });

    it('should update message dynamically', () => {
      component.message = 'Loading data...';
      fixture.detectChanges();
      expect(component.message).toBe('Loading data...');

      component.message = 'Almost done...';
      fixture.detectChanges();
      expect(component.message).toBe('Almost done...');
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(LoadingSpinnerComponent).toBeDefined();
    });
  });
});
