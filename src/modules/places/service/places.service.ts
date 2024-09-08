import { Injectable } from '@nestjs/common';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { UpdatePlaceDto } from '../dto/update-place.dto';
import { FindManyPlacesDto } from '../dto/find-many-places-dto';
import { PlacesRepository } from '../repository/places.repository';
import { FailedToCreatePlaceError } from '../error/failed-to-create-place';
import { PlaceEntity } from '../entities/place.entity';
import { FailedToFindPlaceError } from '../error/failed-to-find-place';
import { FailedToUpdatePlaceError } from '../error/failed-to-update-place';
import { FailedToRemovePlaceError } from '../error/failed-to-remove-place';

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

  async update(id: string, updatePlaceDto: UpdatePlaceDto) {
    const updatedPlace = await this.placesRepository
      .update(id, updatePlaceDto)
      .catch(() => {
        throw new FailedToUpdatePlaceError();
      });

    return new PlaceEntity(updatedPlace);
  }

  async remove(id: string): Promise<boolean> {
    await this.placesRepository.remove(id).catch(() => {
      throw new FailedToRemovePlaceError();
    });

    return true;
  }
}
