import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripsRepository } from './trips.repository';
import { TripsService } from './trips.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trip])],
  providers: [TripsRepository, TripsService],
  exports: [TripsRepository, TripsService],
})
export class TripsModule {}
