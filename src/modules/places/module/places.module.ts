import { Module } from '@nestjs/common';
import { PlacesController } from '../controller/places.controller';
import { PlacesService } from '../service/places.service';
import { PlacesRepository } from '../repository/places.repository';
import { PrismaModule } from '../../../infrastructure/orm/prisma/module/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlacesController],
  providers: [PlacesService, PlacesRepository],
})
export class PlacesModule {}
