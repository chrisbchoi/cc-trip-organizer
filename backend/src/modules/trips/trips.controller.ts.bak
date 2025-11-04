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
  Header,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';
import { ItineraryService } from '../itinerary/itinerary.service';

/**
 * Controller for managing trips
 * Base route: /api/trips
 */
@Controller('api/trips')
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly itineraryService: ItineraryService,
  ) {}

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

  /**
   * Export trip as JSON
   * GET /api/trips/:id/export/json
   * @param id - Trip ID
   * @returns Trip with all itinerary items as formatted JSON
   * @throws NotFoundException if trip not found (404)
   */
  @Get(':id/export/json')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  async exportToJson(@Param('id') id: string): Promise<any> {
    // Get trip data
    const trip = await this.tripsService.findOne(id);
    
    // Get all itinerary items for this trip
    const itineraryItems = await this.itineraryService.findByTripId(id);
    
    // Construct export object with trip and items
    const exportData = {
      trip: {
        id: trip.id,
        title: trip.title,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
      },
      itineraryItems: itineraryItems,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    return exportData;
  }
}
