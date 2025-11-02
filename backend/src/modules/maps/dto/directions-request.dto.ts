import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Coordinates DTO
 */
class CoordinatesDto {
  @IsNumber()
  @IsNotEmpty()
  latitude!: number;

  @IsNumber()
  @IsNotEmpty()
  longitude!: number;
}

/**
 * DTO for directions requests between two locations
 */
export class DirectionsRequestDto {
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsNotEmpty()
  from!: CoordinatesDto;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsNotEmpty()
  to!: CoordinatesDto;
}
