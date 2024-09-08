import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlacesService } from '../service/places.service';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { UpdatePlaceDto } from '../dto/update-place.dto';
import { Roles } from '../../../common/decorator/roles.decorator';
import { FindManyPlacesDto } from '../dto/find-many-places-dto';
import { Public } from '../../../common/decorator/public.decorator';
import { PlaceEntity } from '../entities/place.entity';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @Roles(['ADMIN'])
  async create(@Body() createPlaceDto: CreatePlaceDto): Promise<PlaceEntity> {
    return await this.placesService.create(createPlaceDto);
  }

  @Public()
  @Get()
  async findMany(
    @Body() findManyPlacesDto: FindManyPlacesDto,
  ): Promise<PlaceEntity[]> {
    return await this.placesService.findMany(findManyPlacesDto);
  }

  @Patch(':id')
  @Roles(['ADMIN'])
  async update(
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ): Promise<PlaceEntity> {
    return await this.placesService.update(id, updatePlaceDto);
  }

  @Delete(':id')
  @Roles(['ADMIN'])
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.placesService.remove(id);
  }
}
