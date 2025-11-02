import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripsRepository } from './trips.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Trip])],
  providers: [TripsRepository],
  exports: [TripsRepository],
})
export class TripsModule {}
