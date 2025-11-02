import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';

/**
 * Controller for managing trips
 * Base route: /api/trips
 */
@Controller('api/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  /**
   * Get all trips
   * GET /api/trips
   * @returns Array of all trips
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Trip[]> {
    return this.tripsService.findAll();
  }

  /**
   * Get a single trip by ID
   * GET /api/trips/:id
   * @param id - Trip ID
   * @returns Trip object
   * @throws NotFoundException if trip not found (404)
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Trip> {
    return this.tripsService.findOne(id);
  }

  /**
   * Create a new trip
   * POST /api/trips
   * @param createTripDto - Trip data
   * @returns Created trip
   * @throws BadRequestException if validation fails (400)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createTripDto: CreateTripDto,
  ): Promise<Trip> {
    return this.tripsService.create(createTripDto);
  }

  /**
   * Update an existing trip
   * PUT /api/trips/:id
   * @param id - Trip ID
   * @param updateTripDto - Updated trip data
   * @returns Updated trip
   * @throws NotFoundException if trip not found (404)
   * @throws BadRequestException if validation fails (400)
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateTripDto: UpdateTripDto,
  ): Promise<Trip> {
    return this.tripsService.update(id, updateTripDto);
  }

  /**
   * Delete a trip
   * DELETE /api/trips/:id
   * @param id - Trip ID
   * @returns void (204 No Content)
   * @throws NotFoundException if trip not found (404)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.tripsService.remove(id);
  }
}
