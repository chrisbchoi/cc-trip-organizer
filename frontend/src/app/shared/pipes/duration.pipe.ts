import { Pipe, PipeTransform } from '@angular/core';
import { formatDuration } from '../../core/utils/date.utils';

/**
 * Pipe for displaying durations in human-readable format.
 * Converts duration in minutes to formatted string (e.g., "2h 30m").
 * 
 * Usage:
 * ```
 * {{ 150 | duration }}  // Output: "2h 30m"
 * {{ 45 | duration }}   // Output: "45m"
 * {{ 1440 | duration }} // Output: "1d"
 * ```
 * 
 * Standalone pipe that can be imported directly into components.
 */
@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  /**
   * Transform duration in minutes to formatted string.
   * @param value - Duration in minutes
   * @returns Formatted duration string, or empty string if invalid
   */
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value !== 'number' || isNaN(value)) {
      return '';
    }
    
    return formatDuration(value);
  }
}
