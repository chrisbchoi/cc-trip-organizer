import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTripDto } from './create-trip.dto';

describe('CreateTripDto', () => {
  describe('title validation', () => {
    it('should pass validation with valid title', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'My Trip',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when title is empty', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints?.['isNotEmpty']).toBeDefined();
    });

    it('should fail validation when title is missing', async () => {
      const dto = plainToInstance(CreateTripDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
      expect(titleError?.constraints?.['isNotEmpty']).toBeDefined();
    });

    it('should fail validation when title exceeds 255 characters', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'a'.repeat(256),
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints?.['maxLength']).toBeDefined();
    });
  });

  describe('description validation', () => {
    it('should pass validation with valid description', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'My Trip',
        description: 'A wonderful trip',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when description is missing', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'My Trip',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when description exceeds 2000 characters', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'My Trip',
        description: 'a'.repeat(2001),
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints?.['maxLength']).toBeDefined();
    });
  });

  describe('date validation', () => {
    it('should pass validation with valid dates', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'My Trip',
        startDate: '2025-11-01T00:00:00.000Z',
        endDate: '2025-11-10T00:00:00.000Z',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when dates are missing', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'My Trip',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when startDate is invalid', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'My Trip',
        startDate: 'not-a-date',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const dateError = errors.find((e) => e.property === 'startDate');
      expect(dateError).toBeDefined();
      expect(dateError?.constraints?.['isDateString']).toBeDefined();
    });

    it('should fail validation when endDate is invalid', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'My Trip',
        endDate: 'not-a-date',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const dateError = errors.find((e) => e.property === 'endDate');
      expect(dateError).toBeDefined();
      expect(dateError?.constraints?.['isDateString']).toBeDefined();
    });

    it('should fail validation when endDate is before startDate', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'My Trip',
        startDate: '2025-11-10T00:00:00.000Z',
        endDate: '2025-11-01T00:00:00.000Z',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const dateError = errors.find((e) => e.property === 'endDate');
      expect(dateError).toBeDefined();
      expect(dateError?.constraints?.['isAfterDate']).toBeDefined();
    });

    it('should fail validation when endDate equals startDate', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'My Trip',
        startDate: '2025-11-01T00:00:00.000Z',
        endDate: '2025-11-01T00:00:00.000Z',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const dateError = errors.find((e) => e.property === 'endDate');
      expect(dateError).toBeDefined();
      expect(dateError?.constraints?.['isAfterDate']).toBeDefined();
    });
  });

  describe('transformation', () => {
    it('should transform date strings to ISO format', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'My Trip',
        startDate: '2025-11-01',
        endDate: '2025-11-10',
      });

      // Transform should convert to ISO string
      expect(dto.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(dto.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('complete trip data', () => {
    it('should validate a complete trip successfully', async () => {
      const dto = plainToInstance(CreateTripDto, {
        title: 'European Adventure',
        description:
          'A two-week trip through Europe visiting Paris, Rome, and Barcelona',
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-15T00:00:00.000Z',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.title).toBe('European Adventure');
      expect(dto.description).toBe(
        'A two-week trip through Europe visiting Paris, Rome, and Barcelona',
      );
    });
  });
});
