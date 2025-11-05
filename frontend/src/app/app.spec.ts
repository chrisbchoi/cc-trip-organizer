import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { EnvironmentService } from './core/services/environment.service';

describe('App', () => {
  let mockEnvironmentService: jasmine.SpyObj<EnvironmentService>;

  beforeEach(async () => {
    mockEnvironmentService = jasmine.createSpyObj('EnvironmentService', [], {
      apiUrl: 'http://localhost:3000/api',
      appName: 'Trip Organizer',
      isProduction: false,
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: EnvironmentService, useValue: mockEnvironmentService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render app name from environment service', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Trip Organizer');
  });

  it('should display environment configuration', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Environment Configuration');
    expect(compiled.textContent).toContain('http://localhost:3000/api');
  });
});
