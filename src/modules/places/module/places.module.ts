import { Module } from '@nestjs/common';
import { PlacesController } from '../controller/places.controller';
import { PlacesService } from '../service/places.service';

@Module({
  controllers: [PlacesController],
  providers: [PlacesService],
})
export class PlacesModule {}
