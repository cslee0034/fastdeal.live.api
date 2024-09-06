import { Injectable } from '@nestjs/common';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { UpdatePlaceDto } from '../dto/update-place.dto';
import { FindPlaceDto } from '../dto/find-place-dto';

@Injectable()
export class PlacesService {
  create(createPlaceDto: CreatePlaceDto) {
    return 'This action adds a new place';
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
