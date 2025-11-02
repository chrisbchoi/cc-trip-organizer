import { PartialType } from '@nestjs/mapped-types';
import { CreateTripDto } from './create-trip.dto';

export class UpdateTripDto extends PartialType(CreateTripDto) {
  /**
   * All fields from CreateTripDto are now optional
   * Inherits validation rules from CreateTripDto
   */
}
