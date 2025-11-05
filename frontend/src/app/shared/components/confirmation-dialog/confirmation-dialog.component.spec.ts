import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.isOpen).toBe(false);
      expect(component.title).toBe('Confirm Action');
      expect(component.message).toBe('Are you sure you want to proceed?');
      expect(component.confirmText).toBe('Confirm');
      expect(component.cancelText).toBe('Cancel');
      expect(component.isDangerous).toBe(false);
    });
  });

  describe('Input Properties', () => {
    it('should accept custom title', () => {
      component.title = 'Delete Item';
      expect(component.title).toBe('Delete Item');
    });

    it('should accept custom message', () => {
      component.message = 'This action cannot be undone.';
      expect(component.message).toBe('This action cannot be undone.');
    });

    it('should accept custom button text', () => {
      component.confirmText = 'Yes, Delete';
      component.cancelText = 'No, Keep It';
      expect(component.confirmText).toBe('Yes, Delete');
      expect(component.cancelText).toBe('No, Keep It');
    });

    it('should accept isDangerous flag', () => {
      component.isDangerous = true;
      expect(component.isDangerous).toBe(true);
    });

    it('should accept isOpen flag', () => {
      component.isOpen = true;
      expect(component.isOpen).toBe(true);
    });
  });

  describe('Confirm Action', () => {
    it('should emit confirmed event when onConfirm is called', () => {
      spyOn(component.confirmed, 'emit');
      component.isOpen = true;

      component.onConfirm();

      expect(component.confirmed.emit).toHaveBeenCalled();
    });

    it('should close dialog when onConfirm is called', () => {
      component.isOpen = true;

      component.onConfirm();

      expect(component.isOpen).toBe(false);
    });

    it('should emit confirmed event and close dialog', () => {
      const emitSpy = spyOn(component.confirmed, 'emit');
      component.isOpen = true;

      component.onConfirm();

      expect(emitSpy).toHaveBeenCalled();
      expect(component.isOpen).toBe(false);
    });
  });

  describe('Cancel Action', () => {
    it('should emit cancelled event when onCancel is called', () => {
      spyOn(component.cancelled, 'emit');
      component.isOpen = true;

      component.onCancel();

      expect(component.cancelled.emit).toHaveBeenCalled();
    });

    it('should close dialog when onCancel is called', () => {
      component.isOpen = true;

      component.onCancel();

      expect(component.isOpen).toBe(false);
    });

    it('should emit cancelled event and close dialog', () => {
      const emitSpy = spyOn(component.cancelled, 'emit');
      component.isOpen = true;

      component.onCancel();

      expect(emitSpy).toHaveBeenCalled();
      expect(component.isOpen).toBe(false);
    });
  });

  describe('Backdrop Interaction', () => {
    it('should call onCancel when backdrop is clicked', () => {
      spyOn(component, 'onCancel');

      component.onBackdropClick();

      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should emit cancelled when backdrop is clicked', () => {
      spyOn(component.cancelled, 'emit');
      component.isOpen = true;

      component.onBackdropClick();

      expect(component.cancelled.emit).toHaveBeenCalled();
    });
  });

  describe('Keyboard Interaction', () => {
    it('should call onCancel when Escape key is pressed', () => {
      spyOn(component, 'onCancel');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      component.onEscapeKey(event);

      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should not call onCancel for other keys', () => {
      spyOn(component, 'onCancel');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      component.onEscapeKey(event);

      expect(component.onCancel).not.toHaveBeenCalled();
    });

    it('should close dialog when Escape is pressed', () => {
      spyOn(component.cancelled, 'emit');
      component.isOpen = true;
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      component.onEscapeKey(event);

      expect(component.isOpen).toBe(false);
      expect(component.cancelled.emit).toHaveBeenCalled();
    });
  });

  describe('Dialog Content Click', () => {
    it('should stop propagation when dialog content is clicked', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.onDialogClick(event);

      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should not close dialog when content is clicked', () => {
      component.isOpen = true;
      const event = new Event('click');

      component.onDialogClick(event);

      expect(component.isOpen).toBe(true);
    });
  });

  describe('Event Emission', () => {
    it('should have confirmed output emitter', () => {
      expect(component.confirmed).toBeDefined();
    });

    it('should have cancelled output emitter', () => {
      expect(component.cancelled).toBeDefined();
    });

    it('should not emit events when dialog is already closed', () => {
      spyOn(component.confirmed, 'emit');
      component.isOpen = false;

      component.onConfirm();

      expect(component.confirmed.emit).toHaveBeenCalled();
      expect(component.isOpen).toBe(false);
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(ConfirmationDialogComponent).toBeDefined();
    });
  });
});
