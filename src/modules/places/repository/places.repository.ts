import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { Place } from '@prisma/client';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { FindPlacesDto } from '../dto/find-places-dto';
import { REPOSITORY_CONSTANT } from '../../../common/constant/repository.constant';
import { UpdatePlaceDto } from '../dto/update-place.dto';

@Injectable()
export class PlacesRepository {
  constructor(private prisma: PrismaService) {}

  async create(createPlaceDto: CreatePlaceDto): Promise<Place> {
    return await this.prisma.place.create({
      data: createPlaceDto,
    });
  }

  async findMany(findPlacesDto: FindPlacesDto): Promise<Place[]> {
    return await this.prisma.place.findMany({
      where: {
        city: findPlacesDto.city,
        district:
          findPlacesDto?.district || REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
        street: findPlacesDto?.street || REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
        streetNumber:
          findPlacesDto?.streetNumber || REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
      },
      skip: findPlacesDto?.skip || REPOSITORY_CONSTANT.DEFAULT_SKIP,
      take: findPlacesDto?.take || REPOSITORY_CONSTANT.DEFAULT_TAKE,
    });
  }

  async update(id: string, updatePlaceDto: UpdatePlaceDto): Promise<Place> {
    return await this.prisma.place.update({
      where: { id },
      data: updatePlaceDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.place.delete({
      where: { id },
    });
  }
}
