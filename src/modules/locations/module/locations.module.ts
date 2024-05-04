import { Module } from '@nestjs/common';
import { LocationsService } from '../service/locations.service';
import { LocationsController } from '../controller/locations.controller';

@Module({
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
