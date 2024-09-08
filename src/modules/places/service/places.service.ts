import { Injectable } from '@nestjs/common';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { UpdatePlaceDto } from '../dto/update-place.dto';
import { FindPlaceDto } from '../dto/find-place-dto';
import { PlacesRepository } from '../repository/places.repository';
import { FailedToCreatePlaceError } from '../error/failed-to-create-place';
import { PlaceEntity } from '../entities/place.entity';

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

  find(findPlaceDto: FindPlaceDto) {
    return `This action returns all places`;
  }

  update(id: string, updatePlaceDto: UpdatePlaceDto) {
    return `This action updates a #${id} place`;
  }

  remove(id: string) {
    return `This action removes a #${id} place`;
  }
}
