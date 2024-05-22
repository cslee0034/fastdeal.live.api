import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { CreateTravelAlertDto } from '../dto/create-travel-alert.dto';

@Injectable()
export class CountriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto) {
    return this.prisma.country.create({ data: createCountryDto });
  }

  async update(updateCountryDto: UpdateCountryDto) {
    const { fromCountryId, ...newCountryInfo } = updateCountryDto;

    return this.prisma.country.update({
      where: { id: fromCountryId },
      data: newCountryInfo,
    });
  }

  async delete(id: string) {
    return this.prisma.country.delete({ where: { id } });
  }

  async createTravelAlert(travelAlert: CreateTravelAlertDto) {
    return this.prisma.travelAlert.create({
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

  async getTravelAlerts(countryCode: string) {
    return this.prisma.travelAlert.findMany({
      where: { nationality: { countryCode } },
    });
  }
}
