import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { TripsModule } from './modules/trips/trips.module';
import { ItineraryModule } from './modules/itinerary/itinerary.module';

@Module({
  imports: [DatabaseModule, TripsModule, ItineraryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
