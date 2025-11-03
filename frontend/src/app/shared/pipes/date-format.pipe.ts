import { Pipe, PipeTransform } from '@angular/core';
import { formatDate, formatTime, formatDateTime } from '../../core/utils/date.utils';

/**
 * Pipe for formatting dates in consistent format across the application.
 * Provides various formatting options for dates, times, and datetimes.
 * 
 * Usage:
 * ```
 * {{ date | dateFormat }}                    // Medium date format (default)
 * {{ date | dateFormat:'short' }}            // Short date format
 * {{ date | dateFormat:'long' }}             // Long date format
 * {{ date | dateFormat:'full' }}             // Full date format
 * {{ date | dateFormat:'time' }}             // Time only
 * {{ date | dateFormat:'time':true }}        // Time with seconds
 * {{ date | dateFormat:'datetime' }}         // Date and time
 * {{ date | dateFormat:'datetime':'medium':true }}  // Date and time with seconds
 * ```
 * 
 * Standalone pipe that can be imported directly into components.
 */
@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  /**
   * Transform a date to formatted string.
   * @param value - Date to format
   * @param format - Format type ('short', 'medium', 'long', 'full', 'time', 'datetime')
   * @param dateStyle - Date style for datetime format ('short', 'medium', 'long', 'full')
   * @param includeSeconds - Whether to include seconds in time formats
   * @returns Formatted date string, or empty string if invalid
   */
  transform(
    value: Date | string | null | undefined,
    format: 'short' | 'medium' | 'long' | 'full' | 'time' | 'datetime' = 'medium',
    dateStyle: 'short' | 'medium' | 'long' | 'full' = 'medium',
    includeSeconds: boolean = false
  ): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    let date: Date;
    
    if (typeof value === 'string') {
      date = new Date(value);
    } else if (value instanceof Date) {
      date = value;
    } else {
      return '';
    }
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    switch (format) {
      case 'time':
        return formatTime(date, includeSeconds);
      case 'datetime':
        return formatDateTime(date, dateStyle, includeSeconds);
      case 'short':
      case 'medium':
      case 'long':
      case 'full':
        return formatDate(date, format);
      default:
        return formatDate(date, 'medium');
    }
  }
}
