import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class UpdateItineraryItemDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @IsDateString({}, { message: 'Start date must be a valid date' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'End date must be a valid date' })
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Notes must not exceed 2000 characters' })
  notes?: string;

  @IsOptional()
  orderIndex?: number;
}
