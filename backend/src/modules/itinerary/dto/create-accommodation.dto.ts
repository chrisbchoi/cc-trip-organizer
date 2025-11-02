import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsOptional()
  latitude?: number | null;

  @IsOptional()
  longitude?: number | null;

  @IsOptional()
  placeId?: string;
}

export class CreateAccommodationDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title!: string;

  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate!: string;

  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Notes must not exceed 2000 characters' })
  notes?: string;

  @IsOptional()
  orderIndex?: number;

  @IsString()
  @IsNotEmpty({ message: 'Accommodation name is required' })
  @MaxLength(255)
  name!: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  confirmationNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phoneNumber?: string;
}
