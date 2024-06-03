import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { CreateCityDto } from '../dto/create-city.dto';

@Injectable()
export class CitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCityDto) {
    return await this.prisma.city.create({
      data: {
        cityName: createCountryDto.cityName,
        country: {
          connect: {
            countryCode: createCountryDto.countryCode,
          },
        },
        isAvailable: true,
      },
    });
  }
}
