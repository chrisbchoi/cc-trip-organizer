import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO for geocoding address requests
 */
export class GeocodeRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Address must be at least 3 characters long' })
  address!: string;
}
