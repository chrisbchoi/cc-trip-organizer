import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationCache } from './entities/location-cache.entity';
import { LocationCacheRepository } from './location-cache.repository';
import { GeocodingService } from './geocoding.service';
import { MapsService } from './maps.service';

@Module({
  imports: [TypeOrmModule.forFeature([LocationCache])],
  providers: [LocationCacheRepository, GeocodingService, MapsService],
  exports: [LocationCacheRepository, GeocodingService, MapsService],
})
export class MapsModule {}
