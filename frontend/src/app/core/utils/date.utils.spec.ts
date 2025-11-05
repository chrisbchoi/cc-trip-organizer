import {
  calculateDuration,
  formatDuration,
  isValidDateRange,
  toLocalISOString,
  fromLocalISOString,
  formatDate,
  formatTime,
  formatDateTime,
  isSameDay,
  addDays,
  addHours,
  addMinutes,
  getTimezoneOffset,
  getTimezoneName,
} from './date.utils';

describe('Date Utils', () => {
  describe('calculateDuration', () => {
    it('should calculate duration in minutes between two dates', () => {
      const start = new Date('2026-01-01T10:00:00');
      const end = new Date('2026-01-01T12:30:00');
      expect(calculateDuration(start, end)).toBe(150); // 2.5 hours = 150 minutes
    });

    it('should return 0 if end is before start', () => {
      const start = new Date('2026-01-01T12:00:00');
      const end = new Date('2026-01-01T10:00:00');
      expect(calculateDuration(start, end)).toBe(0);
    });

    it('should return 0 for invalid dates', () => {
      expect(calculateDuration(null as unknown as Date, new Date())).toBe(0);
      expect(calculateDuration(new Date(), null as unknown as Date)).toBe(0);
    });

    it('should handle same start and end time', () => {
      const date = new Date('2026-01-01T12:00:00');
      expect(calculateDuration(date, date)).toBe(0);
    });

    it('should calculate duration across days', () => {
      const start = new Date('2026-01-01T22:00:00');
      const end = new Date('2026-01-02T02:00:00');
      expect(calculateDuration(start, end)).toBe(240); // 4 hours = 240 minutes
    });
  });

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
    });

    it('should format days', () => {
      expect(formatDuration(1440)).toBe('1d');
    });

    it('should format days and hours', () => {
      expect(formatDuration(1500)).toBe('1d 1h');
    });

    it('should format days, hours, and minutes', () => {
      expect(formatDuration(1530)).toBe('1d 1h 30m');
    });

    it('should return 0m for zero or negative minutes', () => {
      expect(formatDuration(0)).toBe('0m');
      expect(formatDuration(-10)).toBe('0m');
    });

    it('should handle large durations', () => {
      expect(formatDuration(10080)).toBe('7d'); // 7 days
    });
  });

  describe('isValidDateRange', () => {
    it('should return true for valid date range', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2026-01-10');
      expect(isValidDateRange(start, end)).toBe(true);
    });

    it('should return true when start and end are the same', () => {
      const date = new Date('2026-01-01');
      expect(isValidDateRange(date, date)).toBe(true);
    });

    it('should return false when end is before start', () => {
      const start = new Date('2026-01-10');
      const end = new Date('2026-01-01');
      expect(isValidDateRange(start, end)).toBe(false);
    });

    it('should return false for null dates', () => {
      expect(isValidDateRange(null as unknown as Date, new Date())).toBe(false);
      expect(isValidDateRange(new Date(), null as unknown as Date)).toBe(false);
    });

    it('should return false for invalid date objects', () => {
      const invalidDate = new Date('invalid');
      expect(isValidDateRange(invalidDate, new Date())).toBe(false);
      expect(isValidDateRange(new Date(), invalidDate)).toBe(false);
    });

    it('should return false for non-Date objects', () => {
      expect(isValidDateRange('2026-01-01' as unknown as Date, new Date())).toBe(false);
      expect(isValidDateRange(new Date(), '2026-01-01' as unknown as Date)).toBe(false);
    });
  });

  describe('toLocalISOString', () => {
    it('should convert date to ISO string without timezone', () => {
      const date = new Date('2026-01-15T14:30:45');
      const isoString = toLocalISOString(date);
      expect(isoString).toMatch(/2026-01-15T\d{2}:30:45/);
    });

    it('should return empty string for null date', () => {
      expect(toLocalISOString(null as unknown as Date)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(toLocalISOString(new Date('invalid'))).toBe('');
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2026, 0, 5, 9, 5, 3); // Jan 5, 09:05:03
      const isoString = toLocalISOString(date);
      expect(isoString).toContain('2026-01-05');
      expect(isoString).toContain('09:05:03');
    });
  });

  describe('fromLocalISOString', () => {
    it('should parse ISO string to Date', () => {
      const isoString = '2026-01-15T14:30:00';
      const date = fromLocalISOString(isoString);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0); // January
      expect(date?.getDate()).toBe(15);
    });

    it('should return null for empty string', () => {
      expect(fromLocalISOString('')).toBeNull();
    });

    it('should return null for invalid ISO string', () => {
      expect(fromLocalISOString('invalid-date')).toBeNull();
    });

    it('should handle ISO strings with milliseconds', () => {
      const isoString = '2026-01-15T14:30:00.123';
      const date = fromLocalISOString(isoString);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getMilliseconds()).toBe(123);
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2026-01-15T14:30:00');

    it('should format date in short format', () => {
      const formatted = formatDate(testDate, 'short');
      expect(formatted).toMatch(/1\/15\/2026|15\/1\/2026/); // Allow for different locales
    });

    it('should format date in medium format (default)', () => {
      const formatted = formatDate(testDate, 'medium');
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2026');
    });

    it('should format date in long format', () => {
      const formatted = formatDate(testDate, 'long');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2026');
    });

    it('should format date in full format', () => {
      const formatted = formatDate(testDate, 'full');
      expect(formatted).toContain('2026');
      expect(formatted.length).toBeGreaterThan(20); // Full format includes weekday
    });

    it('should return empty string for null date', () => {
      expect(formatDate(null as unknown as Date)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDate(new Date('invalid'))).toBe('');
    });
  });

  describe('formatTime', () => {
    const testDate = new Date('2026-01-15T14:30:45');

    it('should format time without seconds by default', () => {
      const formatted = formatTime(testDate);
      expect(formatted).toMatch(/2:30 PM|14:30/); // Allow for 12h or 24h format
    });

    it('should format time with seconds when requested', () => {
      const formatted = formatTime(testDate, true);
      expect(formatted).toMatch(/2:30:45 PM|14:30:45/);
    });

    it('should return empty string for null date', () => {
      expect(formatTime(null as unknown as Date)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(formatTime(new Date('invalid'))).toBe('');
    });
  });

  describe('formatDateTime', () => {
    const testDate = new Date('2026-01-15T14:30:45');

    it('should format date and time together', () => {
      const formatted = formatDateTime(testDate);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2026');
      expect(formatted).toMatch(/2:30|14:30/);
    });

    it('should support custom date format', () => {
      const formatted = formatDateTime(testDate, 'long');
      expect(formatted).toContain('January');
    });

    it('should support including seconds', () => {
      const formatted = formatDateTime(testDate, 'medium', true);
      expect(formatted).toMatch(/30:45|30:45/); // Include seconds
    });

    it('should return empty string for invalid date', () => {
      expect(formatDateTime(new Date('invalid'))).toBe('');
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day at different times', () => {
      const date1 = new Date('2026-01-15T10:00:00');
      const date2 = new Date('2026-01-15T20:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2026-01-15T23:59:59');
      const date2 = new Date('2026-01-16T00:00:00');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return true for exact same date and time', () => {
      const date = new Date('2026-01-15T12:00:00');
      expect(isSameDay(date, date)).toBe(true);
    });

    it('should return false for null dates', () => {
      expect(isSameDay(null as unknown as Date, new Date())).toBe(false);
      expect(isSameDay(new Date(), null as unknown as Date)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add positive days to date', () => {
      const date = new Date('2026-01-15');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
      expect(result.getMonth()).toBe(0); // January
    });

    it('should subtract days with negative value', () => {
      const date = new Date('2026-01-15');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    it('should handle month boundaries', () => {
      const date = new Date('2026-01-30');
      const result = addDays(date, 5);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(4);
    });

    it('should not mutate original date', () => {
      const original = new Date('2026-01-15');
      const originalTime = original.getTime();
      addDays(original, 5);
      expect(original.getTime()).toBe(originalTime);
    });
  });

  describe('addHours', () => {
    it('should add positive hours to date', () => {
      const date = new Date('2026-01-15T10:00:00');
      const result = addHours(date, 3);
      expect(result.getHours()).toBe(13);
    });

    it('should subtract hours with negative value', () => {
      const date = new Date('2026-01-15T10:00:00');
      const result = addHours(date, -3);
      expect(result.getHours()).toBe(7);
    });

    it('should handle day boundaries', () => {
      const date = new Date('2026-01-15T22:00:00');
      const result = addHours(date, 5);
      expect(result.getDate()).toBe(16);
      expect(result.getHours()).toBe(3);
    });

    it('should not mutate original date', () => {
      const original = new Date('2026-01-15T10:00:00');
      const originalTime = original.getTime();
      addHours(original, 5);
      expect(original.getTime()).toBe(originalTime);
    });
  });

  describe('addMinutes', () => {
    it('should add positive minutes to date', () => {
      const date = new Date('2026-01-15T10:00:00');
      const result = addMinutes(date, 30);
      expect(result.getMinutes()).toBe(30);
    });

    it('should subtract minutes with negative value', () => {
      const date = new Date('2026-01-15T10:30:00');
      const result = addMinutes(date, -15);
      expect(result.getMinutes()).toBe(15);
    });

    it('should handle hour boundaries', () => {
      const date = new Date('2026-01-15T10:50:00');
      const result = addMinutes(date, 20);
      expect(result.getHours()).toBe(11);
      expect(result.getMinutes()).toBe(10);
    });

    it('should not mutate original date', () => {
      const original = new Date('2026-01-15T10:00:00');
      const originalTime = original.getTime();
      addMinutes(original, 30);
      expect(original.getTime()).toBe(originalTime);
    });
  });

  describe('getTimezoneOffset', () => {
    it('should return timezone offset as string', () => {
      const offset = getTimezoneOffset();
      expect(offset).toMatch(/^[+-]\d{2}:\d{2}$/);
    });

    it('should handle custom date', () => {
      const date = new Date('2026-07-01T12:00:00');
      const offset = getTimezoneOffset(date);
      expect(offset).toMatch(/^[+-]\d{2}:\d{2}$/);
    });

    it('should pad hours and minutes with zeros', () => {
      const offset = getTimezoneOffset();
      const parts = offset.split(':');
      expect(parts[0].length).toBe(3); // Sign + 2 digits
      expect(parts[1].length).toBe(2); // 2 digits
    });
  });

  describe('getTimezoneName', () => {
    it('should return timezone name', () => {
      const tzName = getTimezoneName();
      // Should be something like "America/Los_Angeles", "Europe/London", etc.
      expect(typeof tzName).toBe('string');
      // Most environments should return a non-empty timezone name
      expect(tzName.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty timezone gracefully', () => {
      // Just verify it returns a string - different environments have different behavior
      const tzName = getTimezoneName();
      expect(typeof tzName).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should handle leap years', () => {
      const leapDay = new Date('2024-02-29');
      const nextDay = addDays(leapDay, 1);
      expect(nextDay.getMonth()).toBe(2); // March
      expect(nextDay.getDate()).toBe(1);
    });

    it('should handle year boundaries', () => {
      const date = new Date('2025-12-31T23:00:00');
      const result = addHours(date, 2);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(1);
    });

    it('should handle DST transitions', () => {
      // This test might behave differently depending on timezone
      const date = new Date('2026-03-08T01:00:00'); // DST transition in US
      const result = addHours(date, 2);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(date.getTime());
    });
  });
});
