import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { CreateTravelAlertDto } from '../dto/create-travel-alert.dto';
import { Country, TravelAlert } from '@prisma/client';

@Injectable()
export class CountriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto): Promise<Country> {
    return await this.prisma.country.create({ data: createCountryDto });
  }

  async update(updateCountryDto: UpdateCountryDto): Promise<Country> {
    return await this.prisma.country.update({
      where: { id: updateCountryDto.id },
      data: updateCountryDto,
    });
  }

  async delete(id: string): Promise<Country> {
    return await this.prisma.country.delete({ where: { id } });
  }

  async createTravelAlert(
    travelAlert: CreateTravelAlertDto,
  ): Promise<TravelAlert> {
    return await this.prisma.travelAlert.create({
      data: {
        nationality: {
          connect: {
            countryCode: travelAlert.nationalityCode,
          },
        },
        destination: {
          connect: {
            countryCode: travelAlert.destinationCode,
          },
        },
        alertStatus: travelAlert.alertStatus,
      },
    });
  }

  async findManyTravelAlerts(countryCode: string): Promise<TravelAlert[]> {
    return await this.prisma.travelAlert.findMany({
      where: { nationality: { countryCode } },
    });
  }
}
