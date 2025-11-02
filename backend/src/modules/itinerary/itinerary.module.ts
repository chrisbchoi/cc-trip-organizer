import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { Flight } from './entities/flight.entity';
import { Transport } from './entities/transport.entity';
import { Accommodation } from './entities/accommodation.entity';
import { ItineraryRepository } from './itinerary.repository';
import { ItineraryService } from './itinerary.service';
import { ItineraryController } from './itinerary.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItineraryItem,
      Flight,
      Transport,
      Accommodation,
    ]),
  ],
  controllers: [ItineraryController],
  providers: [ItineraryRepository, ItineraryService],
  exports: [ItineraryRepository, ItineraryService],
})
export class ItineraryModule {}
