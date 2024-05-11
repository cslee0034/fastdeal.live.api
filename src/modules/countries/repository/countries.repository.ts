import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';

@Injectable()
export class CountriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto) {
    return this.prisma.country.create({ data: createCountryDto });
  }

  async update(updateCountryDto: UpdateCountryDto) {
    return this.prisma.country.update({
      where: { id: updateCountryDto.fromCountryId },
      data: updateCountryDto,
    });
  }
}
