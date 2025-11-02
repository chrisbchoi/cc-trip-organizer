import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateTripDto } from './update-trip.dto';

describe('UpdateTripDto', () => {
  it('should allow updating only title', async () => {
    const dto = plainToInstance(UpdateTripDto, {
      title: 'Updated Title',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.title).toBe('Updated Title');
  });

  it('should allow updating only description', async () => {
    const dto = plainToInstance(UpdateTripDto, {
      description: 'Updated description',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.description).toBe('Updated description');
  });

  it('should allow updating only dates', async () => {
    const dto = plainToInstance(UpdateTripDto, {
      startDate: '2025-12-01T00:00:00.000Z',
      endDate: '2025-12-15T00:00:00.000Z',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should allow partial updates with all fields optional', async () => {
    const dto = plainToInstance(UpdateTripDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should still validate title length when provided', async () => {
    const dto = plainToInstance(UpdateTripDto, {
      title: 'a'.repeat(256),
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const titleError = errors.find((e) => e.property === 'title');
    expect(titleError).toBeDefined();
    expect(titleError?.constraints?.['maxLength']).toBeDefined();
  });

  it('should still validate date range when both dates provided', async () => {
    const dto = plainToInstance(UpdateTripDto, {
      startDate: '2025-11-10T00:00:00.000Z',
      endDate: '2025-11-01T00:00:00.000Z',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const dateError = errors.find((e) => e.property === 'endDate');
    expect(dateError).toBeDefined();
    expect(dateError?.constraints?.['isAfterDate']).toBeDefined();
  });

  it('should validate a complete update successfully', async () => {
    const dto = plainToInstance(UpdateTripDto, {
      title: 'Updated European Adventure',
      description: 'Extended trip with additional cities',
      startDate: '2025-12-01T00:00:00.000Z',
      endDate: '2025-12-20T00:00:00.000Z',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
