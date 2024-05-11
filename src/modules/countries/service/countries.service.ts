import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CountriesRepository } from '../repository/countries.repository';
import { CreateCountryDto } from '../dto/create-country.dto';
import { COUNTRIES_ERROR } from '../error/countries.error';
import { UpdateCountryDto } from '../dto/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(private readonly countriesRepository: CountriesRepository) {}

  async create(createCountryDto: CreateCountryDto) {
    try {
      return await this.countriesRepository.create(createCountryDto);
    } catch (error) {
      throw new InternalServerErrorException(
        COUNTRIES_ERROR.CANNOT_CREATE_COUNTRY,
      );
    }
  }

  async update(updateCountryDto: UpdateCountryDto) {
    try {
      return await this.countriesRepository.update(updateCountryDto);
    } catch (error) {
      throw new InternalServerErrorException(
        COUNTRIES_ERROR.CANNOT_UPDATE_COUNTRY,
      );
    }
  }
}
