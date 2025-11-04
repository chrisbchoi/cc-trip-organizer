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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';
import { ItineraryService } from '../itinerary/itinerary.service';
import { ExportService } from './export.service';

/**
 * Controller for managing trips
 * Base route: /api/trips
 */
@Controller('api/trips')
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly itineraryService: ItineraryService,
    private readonly exportService: ExportService,
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
   * @returns Trip with all itinerary items (including type-specific details) as formatted JSON
   * @throws NotFoundException if trip not found (404)
   */
  @Get(':id/export/json')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  async exportToJson(@Param('id') id: string): Promise<any> {
    // Get trip data
    const trip = await this.tripsService.findOne(id);
    
    // Get all itinerary items for this trip (base items only)
    const baseItems = await this.itineraryService.findByTripId(id);
    
    // Fetch each item with its type-specific details
    // findOne in itineraryService loads the flight/transport/accommodation relation
    const itemsWithDetails = await Promise.all(
      baseItems.map(async (baseItem) => {
        const fullItem = await this.itineraryService.findOne(baseItem.id);
        return fullItem;
      }),
    );
    
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
      itineraryItems: itemsWithDetails,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    return exportData;
  }

  /**
   * Export trip as iCalendar (.ics) file
   * GET /api/trips/:id/export/ical
   * @param id - Trip ID
   * @param res - Response object for setting headers and content
   * @returns iCalendar file download
   * @throws NotFoundException if trip not found (404)
   */
  @Get(':id/export/ical')
  @HttpCode(HttpStatus.OK)
  async exportToICalendar(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    // Get trip data
    const trip = await this.tripsService.findOne(id);
    
    // Get all itinerary items with type-specific details
    const baseItems = await this.itineraryService.findByTripId(id);
    const itemsWithDetails = await Promise.all(
      baseItems.map(async (baseItem) => {
        const fullItem = await this.itineraryService.findOne(baseItem.id);
        return fullItem;
      }),
    );
    
    // Generate iCalendar content
    const icalContent = this.exportService.exportToICalendar(trip, itemsWithDetails);
    
    // Sanitize trip title for filename
    const sanitizedTitle = trip.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `trip-${sanitizedTitle}-${new Date().toISOString().split('T')[0]}.ics`;
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(icalContent);
  }
}
