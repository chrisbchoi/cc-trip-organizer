/**
 * Date and time utility functions for the Trip Organizer application.
 * Provides helper methods for date calculations, formatting, and validation.
 */

/**
 * Calculate duration between two dates in minutes.
 * @param start - Start date/time
 * @param end - End date/time
 * @returns Duration in minutes, or 0 if end is before start
 */
export function calculateDuration(start: Date, end: Date): number {
  if (!start || !end) {
    return 0;
  }

  const startTime = start.getTime();
  const endTime = end.getTime();

  if (endTime < startTime) {
    return 0;
  }

  const diffMs = endTime - startTime;
  return Math.floor(diffMs / (1000 * 60)); // Convert to minutes
}

/**
 * Format duration in minutes to human-readable string.
 * Examples:
 * - 45 minutes -> "45m"
 * - 90 minutes -> "1h 30m"
 * - 1440 minutes -> "1d"
 * - 1500 minutes -> "1d 1h"
 *
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes < 0) {
    return '0m';
  }

  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (mins > 0 || parts.length === 0) {
    parts.push(`${mins}m`);
  }

  return parts.join(' ');
}

/**
 * Validate that a date range is valid (end is after start).
 * @param start - Start date/time
 * @param end - End date/time
 * @returns True if the date range is valid
 */
export function isValidDateRange(start: Date, end: Date): boolean {
  if (!start || !end) {
    return false;
  }

  if (!(start instanceof Date) || !(end instanceof Date)) {
    return false;
  }

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return end.getTime() >= start.getTime();
}

/**
 * Convert a date to ISO string in local timezone.
 * @param date - Date to convert
 * @returns ISO string without timezone offset (YYYY-MM-DDTHH:mm:ss)
 */
export function toLocalISOString(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Parse ISO string as local timezone date.
 * @param isoString - ISO string without timezone (YYYY-MM-DDTHH:mm:ss)
 * @returns Date object in local timezone
 */
export function fromLocalISOString(isoString: string): Date | null {
  if (!isoString) {
    return null;
  }

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Format date for display in a consistent format.
 * @param date - Date to format
 * @param format - Format style ('short', 'medium', 'long', 'full')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case 'short':
      options.year = 'numeric';
      options.month = 'numeric';
      options.day = 'numeric';
      break;
    case 'medium':
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
      break;
    case 'long':
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
    case 'full':
      options.weekday = 'long';
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
  }

  return date.toLocaleDateString(undefined, options);
}

/**
 * Format time for display.
 * @param date - Date object containing the time
 * @param includeSeconds - Whether to include seconds
 * @returns Formatted time string (e.g., "2:30 PM" or "14:30")
 */
export function formatTime(date: Date, includeSeconds: boolean = false): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };

  if (includeSeconds) {
    options.second = '2-digit';
  }

  return date.toLocaleTimeString(undefined, options);
}

/**
 * Format date and time together.
 * @param date - Date to format
 * @param dateFormat - Date format style
 * @param includeSeconds - Whether to include seconds in time
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date,
  dateFormat: 'short' | 'medium' | 'long' | 'full' = 'medium',
  includeSeconds: boolean = false,
): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  return `${formatDate(date, dateFormat)} ${formatTime(date, includeSeconds)}`;
}

/**
 * Check if two dates are on the same day (ignoring time).
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if both dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  if (!date1 || !date2 || !(date1 instanceof Date) || !(date2 instanceof Date)) {
    return false;
  }

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Add days to a date.
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add hours to a date.
 * @param date - Starting date
 * @param hours - Number of hours to add (can be negative)
 * @returns New date with hours added
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add minutes to a date.
 * @param date - Starting date
 * @param minutes - Number of minutes to add (can be negative)
 * @returns New date with minutes added
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Get the timezone offset string for a date (e.g., "+05:30", "-08:00").
 * @param date - Date to get timezone offset for
 * @returns Timezone offset string
 */
export function getTimezoneOffset(date: Date = new Date()): string {
  const offset = -date.getTimezoneOffset(); // Negative because getTimezoneOffset returns inverse
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? '+' : '-';

  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Get the timezone name (e.g., "America/Los_Angeles", "Europe/London").
 * @returns Timezone name from Intl API, or empty string if not available
 */
export function getTimezoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return '';
  }
}
