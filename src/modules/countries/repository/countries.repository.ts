import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { CreateTravelAlertDto } from '../dto/create-travel-alert.dto';

@Injectable()
export class CountriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto) {
    return await this.prisma.country.create({ data: createCountryDto });
  }

  async update(updateCountryDto: UpdateCountryDto) {
    return await this.prisma.country.update({
      where: { id: updateCountryDto.id },
      data: updateCountryDto,
    });
  }

  async delete(id: string) {
    return await this.prisma.country.delete({ where: { id } });
  }

  async createTravelAlert(travelAlert: CreateTravelAlertDto) {
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

  async getTravelAlerts(countryCode: string) {
    return await this.prisma.travelAlert.findMany({
      where: { nationality: { countryCode } },
    });
  }
}
