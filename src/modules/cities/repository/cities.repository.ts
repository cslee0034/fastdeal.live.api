import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';

@Injectable()
export class CitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCityDto: CreateCityDto) {
    return await this.prisma.city.create({
      data: {
        cityName: createCityDto.cityName,
        country: {
          connect: {
            countryCode: createCityDto.countryCode,
          },
        },
        isAvailable: true,
      },
    });
  }

  async update(updateCityDto: UpdateCityDto) {
    return await this.prisma.city.update({
      where: {
        cityName: updateCityDto.cityName,
      },
      data: {
        cityName: updateCityDto.cityName,
        country: {
          connect: {
            countryCode: updateCityDto.countryCode,
          },
        },
        isAvailable: updateCityDto.isAvailable,
      },
    });
  }
}
