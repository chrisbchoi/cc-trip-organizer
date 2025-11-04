import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripsRepository } from './trips.repository';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { ItineraryModule } from '../itinerary/itinerary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip]),
    ItineraryModule,
  ],
  controllers: [TripsController],
  providers: [TripsRepository, TripsService],
  exports: [TripsRepository, TripsService],
})
export class TripsModule {}
