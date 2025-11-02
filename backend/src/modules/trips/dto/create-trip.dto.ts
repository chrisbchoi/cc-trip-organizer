import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsAfterDate } from '../../../common/validators/date-validator';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  @Transform(({ value }) => {
    if (!value) return value;
    try {
      return new Date(value).toISOString();
    } catch {
      return value; // Return original value to let validator catch it
    }
  })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  @Transform(({ value }) => {
    if (!value) return value;
    try {
      return new Date(value).toISOString();
    } catch {
      return value; // Return original value to let validator catch it
    }
  })
  @IsAfterDate('startDate', {
    message: 'End date must be after start date',
  })
  endDate?: string;
}
