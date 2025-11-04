import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  get apiUrl(): string {
    return environment.apiUrl;
  }

  get appName(): string {
    return environment.appName;
  }

  get version(): string {
    return environment.version;
  }

  get isProduction(): boolean {
    return environment.production;
  }

  get features(): any {
    return environment.features;
  }

  // Helper method to get full API endpoint URL
  getApiEndpoint(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.apiUrl}/${cleanPath}`;
  }
}
