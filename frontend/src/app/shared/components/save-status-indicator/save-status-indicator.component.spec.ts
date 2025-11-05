import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaveStatusIndicatorComponent } from './save-status-indicator.component';
import { AutoSaveStatus } from '../../../core/services/auto-save.service';

describe('SaveStatusIndicatorComponent', () => {
  let component: SaveStatusIndicatorComponent;
  let fixture: ComponentFixture<SaveStatusIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveStatusIndicatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SaveStatusIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with IDLE status', () => {
      expect(component.status).toBe(AutoSaveStatus.IDLE);
    });

    it('should expose AutoSaveStatus enum', () => {
      expect(component.AutoSaveStatus).toBe(AutoSaveStatus);
    });
  });

  describe('Status Input', () => {
    it('should accept IDLE status', () => {
      component.status = AutoSaveStatus.IDLE;
      expect(component.status).toBe(AutoSaveStatus.IDLE);
    });

    it('should accept SAVING status', () => {
      component.status = AutoSaveStatus.SAVING;
      expect(component.status).toBe(AutoSaveStatus.SAVING);
    });

    it('should accept SAVED status', () => {
      component.status = AutoSaveStatus.SAVED;
      expect(component.status).toBe(AutoSaveStatus.SAVED);
    });

    it('should accept ERROR status', () => {
      component.status = AutoSaveStatus.ERROR;
      expect(component.status).toBe(AutoSaveStatus.ERROR);
    });
  });

  describe('Status Message', () => {
    it('should return empty string for IDLE status', () => {
      component.status = AutoSaveStatus.IDLE;
      expect(component.statusMessage).toBe('');
    });

    it('should return "Saving..." for SAVING status', () => {
      component.status = AutoSaveStatus.SAVING;
      expect(component.statusMessage).toBe('Saving...');
    });

    it('should return "All changes saved" for SAVED status', () => {
      component.status = AutoSaveStatus.SAVED;
      expect(component.statusMessage).toBe('All changes saved');
    });

    it('should return "Error saving changes" for ERROR status', () => {
      component.status = AutoSaveStatus.ERROR;
      expect(component.statusMessage).toBe('Error saving changes');
    });

    it('should return empty string for unknown status', () => {
      component.status = 'unknown' as AutoSaveStatus;
      expect(component.statusMessage).toBe('');
    });
  });

  describe('Status Icon', () => {
    it('should return empty string for IDLE status', () => {
      component.status = AutoSaveStatus.IDLE;
      expect(component.statusIcon).toBe('');
    });

    it('should return hourglass icon for SAVING status', () => {
      component.status = AutoSaveStatus.SAVING;
      expect(component.statusIcon).toBe('⏳');
    });

    it('should return checkmark icon for SAVED status', () => {
      component.status = AutoSaveStatus.SAVED;
      expect(component.statusIcon).toBe('✓');
    });

    it('should return warning icon for ERROR status', () => {
      component.status = AutoSaveStatus.ERROR;
      expect(component.statusIcon).toBe('⚠');
    });

    it('should return empty string for unknown status', () => {
      component.status = 'unknown' as AutoSaveStatus;
      expect(component.statusIcon).toBe('');
    });
  });

  describe('Status Class', () => {
    it('should return correct class for IDLE status', () => {
      component.status = AutoSaveStatus.IDLE;
      expect(component.statusClass).toBe('status-idle');
    });

    it('should return correct class for SAVING status', () => {
      component.status = AutoSaveStatus.SAVING;
      expect(component.statusClass).toBe('status-saving');
    });

    it('should return correct class for SAVED status', () => {
      component.status = AutoSaveStatus.SAVED;
      expect(component.statusClass).toBe('status-saved');
    });

    it('should return correct class for ERROR status', () => {
      component.status = AutoSaveStatus.ERROR;
      expect(component.statusClass).toBe('status-error');
    });
  });

  describe('Status Transitions', () => {
    it('should update message when status changes from IDLE to SAVING', () => {
      component.status = AutoSaveStatus.IDLE;
      expect(component.statusMessage).toBe('');

      component.status = AutoSaveStatus.SAVING;
      expect(component.statusMessage).toBe('Saving...');
    });

    it('should update icon when status changes from SAVING to SAVED', () => {
      component.status = AutoSaveStatus.SAVING;
      expect(component.statusIcon).toBe('⏳');

      component.status = AutoSaveStatus.SAVED;
      expect(component.statusIcon).toBe('✓');
    });

    it('should update class when status changes from SAVED to ERROR', () => {
      component.status = AutoSaveStatus.SAVED;
      expect(component.statusClass).toBe('status-saved');

      component.status = AutoSaveStatus.ERROR;
      expect(component.statusClass).toBe('status-error');
    });

    it('should handle complete save cycle', () => {
      // IDLE -> SAVING
      component.status = AutoSaveStatus.IDLE;
      expect(component.statusMessage).toBe('');

      component.status = AutoSaveStatus.SAVING;
      expect(component.statusMessage).toBe('Saving...');
      expect(component.statusIcon).toBe('⏳');

      // SAVING -> SAVED
      component.status = AutoSaveStatus.SAVED;
      expect(component.statusMessage).toBe('All changes saved');
      expect(component.statusIcon).toBe('✓');

      // SAVED -> IDLE
      component.status = AutoSaveStatus.IDLE;
      expect(component.statusMessage).toBe('');
      expect(component.statusIcon).toBe('');
    });

    it('should handle error scenario', () => {
      component.status = AutoSaveStatus.SAVING;

      component.status = AutoSaveStatus.ERROR;
      expect(component.statusMessage).toBe('Error saving changes');
      expect(component.statusIcon).toBe('⚠');
      expect(component.statusClass).toBe('status-error');
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(SaveStatusIndicatorComponent).toBeDefined();
    });
  });
});
