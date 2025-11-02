import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EnvironmentService } from './core/services/environment.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly environmentService = inject(EnvironmentService);
  protected readonly title = signal('Trip Organizer');

  // Test environment access
  protected readonly apiUrl = signal(this.environmentService.apiUrl);
  protected readonly appName = signal(this.environmentService.appName);
  protected readonly isProduction = signal(this.environmentService.isProduction);
}
