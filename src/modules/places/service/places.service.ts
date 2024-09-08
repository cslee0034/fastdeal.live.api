import { Injectable } from '@nestjs/common';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { UpdatePlaceDto } from '../dto/update-place.dto';
import { FindManyPlacesDto } from '../dto/find-many-places-dto';
import { PlacesRepository } from '../repository/places.repository';
import { FailedToCreatePlaceError } from '../error/failed-to-create-place';
import { PlaceEntity } from '../entities/place.entity';
import { FailedToFindPlaceError } from '../error/failed-to-find-place';

@Injectable()
export class PlacesService {
  constructor(private readonly placesRepository: PlacesRepository) {}

  async create(createPlaceDto: CreatePlaceDto) {
    const place = await this.placesRepository
      .create(createPlaceDto)
      .catch(() => {
        throw new FailedToCreatePlaceError();
      });

    return new PlaceEntity(place);
  }

  async findMany(findManyPlaceDto: FindManyPlacesDto) {
    const places = await this.placesRepository
      .findMany(findManyPlaceDto)
      .catch(() => {
        throw new FailedToFindPlaceError();
      });

    return places.map((place) => new PlaceEntity(place));
  }

  update(id: string, updatePlaceDto: UpdatePlaceDto) {
    return `This action updates a #${id} place`;
  }

  remove(id: string) {
    return `This action removes a #${id} place`;
  }
}
