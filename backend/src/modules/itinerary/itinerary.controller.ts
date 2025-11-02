import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { CreateTransportDto } from './dto/create-transport.dto';
import { CreateAccommodationDto } from './dto/create-accommodation.dto';
import { UpdateItineraryItemDto } from './dto/update-itinerary-item.dto';
import { ReorderItemsDto } from './dto/reorder-items.dto';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { Flight } from './entities/flight.entity';
import { Transport } from './entities/transport.entity';
import { Accommodation } from './entities/accommodation.entity';

/**
 * Controller for managing itinerary items (flights, transport, accommodations)
 */
@Controller('api')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  /**
   * Get all itinerary items for a trip, sorted chronologically
   * @param tripId - Trip ID
   * @returns Promise<ItineraryItem[]>
   */
  @Get('trips/:tripId/itinerary')
  @HttpCode(HttpStatus.OK)
  async findByTripId(@Param('tripId') tripId: string): Promise<ItineraryItem[]> {
    return this.itineraryService.findByTripId(tripId);
  }

  /**
   * Get a single itinerary item by ID
   * @param id - Itinerary item ID
   * @returns Promise<ItineraryItem>
   * @throws NotFoundException if item not found
   */
  @Get('itinerary/:id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<ItineraryItem> {
    return this.itineraryService.findOne(id);
  }

  /**
   * Create a new flight itinerary item
   * @param tripId - Trip ID
   * @param createFlightDto - Flight creation data
   * @returns Promise<{ item: ItineraryItem; flight: Flight }>
   * @throws BadRequestException if validation fails
   */
  @Post('trips/:tripId/itinerary/flight')
  @HttpCode(HttpStatus.CREATED)
  async createFlight(
    @Param('tripId') tripId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    createFlightDto: CreateFlightDto,
  ): Promise<{ item: ItineraryItem; flight: Flight }> {
    return this.itineraryService.createFlight({
      ...createFlightDto,
      tripId,
      startDate: new Date(createFlightDto.startDate),
      endDate: new Date(createFlightDto.endDate),
      departureLocation: {
        ...createFlightDto.departureLocation,
        latitude: createFlightDto.departureLocation.latitude ?? 0,
        longitude: createFlightDto.departureLocation.longitude ?? 0,
      },
      arrivalLocation: {
        ...createFlightDto.arrivalLocation,
        latitude: createFlightDto.arrivalLocation.latitude ?? 0,
        longitude: createFlightDto.arrivalLocation.longitude ?? 0,
      },
    });
  }

  /**
   * Create a new transport itinerary item
   * @param tripId - Trip ID
   * @param createTransportDto - Transport creation data
   * @returns Promise<{ item: ItineraryItem; transport: Transport }>
   * @throws BadRequestException if validation fails
   */
  @Post('trips/:tripId/itinerary/transport')
  @HttpCode(HttpStatus.CREATED)
  async createTransport(
    @Param('tripId') tripId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    createTransportDto: CreateTransportDto,
  ): Promise<{ item: ItineraryItem; transport: Transport }> {
    return this.itineraryService.createTransport({
      ...createTransportDto,
      tripId,
      startDate: new Date(createTransportDto.startDate),
      endDate: new Date(createTransportDto.endDate),
      departureLocation: {
        ...createTransportDto.departureLocation,
        latitude: createTransportDto.departureLocation.latitude ?? 0,
        longitude: createTransportDto.departureLocation.longitude ?? 0,
      },
      arrivalLocation: {
        ...createTransportDto.arrivalLocation,
        latitude: createTransportDto.arrivalLocation.latitude ?? 0,
        longitude: createTransportDto.arrivalLocation.longitude ?? 0,
      },
    });
  }

  /**
   * Create a new accommodation itinerary item
   * @param tripId - Trip ID
   * @param createAccommodationDto - Accommodation creation data
   * @returns Promise<{ item: ItineraryItem; accommodation: Accommodation }>
   * @throws BadRequestException if validation fails
   */
  @Post('trips/:tripId/itinerary/accommodation')
  @HttpCode(HttpStatus.CREATED)
  async createAccommodation(
    @Param('tripId') tripId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    createAccommodationDto: CreateAccommodationDto,
  ): Promise<{ item: ItineraryItem; accommodation: Accommodation }> {
    return this.itineraryService.createAccommodation({
      ...createAccommodationDto,
      tripId,
      startDate: new Date(createAccommodationDto.startDate),
      endDate: new Date(createAccommodationDto.endDate),
      location: {
        ...createAccommodationDto.location,
        latitude: createAccommodationDto.location.latitude ?? 0,
        longitude: createAccommodationDto.location.longitude ?? 0,
      },
    });
  }

  /**
   * Update an itinerary item (base fields only)
   * @param id - Itinerary item ID
   * @param updateDto - Update data
   * @returns Promise<ItineraryItem>
   * @throws NotFoundException if item not found
   * @throws BadRequestException if validation fails
   */
  @Put('itinerary/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    updateDto: UpdateItineraryItemDto,
  ): Promise<ItineraryItem> {
    // Convert date strings to Date objects if provided
    const updateData: any = { ...updateDto };
    if (updateDto.startDate) {
      updateData.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      updateData.endDate = new Date(updateDto.endDate);
    }

    return this.itineraryService.update(id, updateData);
  }

  /**
   * Delete an itinerary item
   * @param id - Itinerary item ID
   * @returns Promise<void>
   * @throws NotFoundException if item not found
   */
  @Delete('itinerary/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.itineraryService.remove(id);
  }

  /**
   * Reorder multiple itinerary items (for drag-drop functionality)
   * @param reorderDto - Array of { id, orderIndex } objects
   * @returns Promise<void>
   * @throws NotFoundException if any item not found
   * @throws BadRequestException if validation fails
   */
  @Patch('itinerary/reorder')
  @HttpCode(HttpStatus.OK)
  async reorder(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    reorderDto: ReorderItemsDto,
  ): Promise<void> {
    return this.itineraryService.reorder(reorderDto.items);
  }
}
