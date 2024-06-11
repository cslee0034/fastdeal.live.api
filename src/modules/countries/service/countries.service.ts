import { Injectable } from '@nestjs/common';
import { CountriesRepository } from '../repository/countries.repository';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { CreateTravelAlertDto } from '../dto/create-travel-alert.dto';
import { CountriesErrorHandler } from '../error/handler/countries.error.handler';
import { CountryEntity } from '../entities/country.entity';

@Injectable()
export class CountriesService {
  constructor(
    private readonly countriesRepository: CountriesRepository,
    private readonly errorHandler: CountriesErrorHandler,
  ) {}

  public async create(createCountryDto: CreateCountryDto) {
    try {
      return new CountryEntity(
        await this.countriesRepository.create(createCountryDto),
      );
    } catch (error) {
      this.errorHandler.create({ error, inputs: createCountryDto });
    }
  }

  public async update(updateCountryDto: UpdateCountryDto) {
    try {
      return new CountryEntity(
        await this.countriesRepository.update(updateCountryDto),
      );
    } catch (error) {
      this.errorHandler.update({ error, inputs: updateCountryDto });
    }
  }

  public async delete(id: string) {
    try {
      return new CountryEntity(await this.countriesRepository.delete(id));
    } catch (error) {
      this.errorHandler.delete({ error, inputs: id });
    }
  }

  public async createTravelAlert(travelAlert: CreateTravelAlertDto) {
    try {
      return await this.countriesRepository.createTravelAlert(travelAlert);
    } catch (error) {
      this.errorHandler.createTravelAlert({ error, inputs: travelAlert });
    }
  }

  public async getTravelAlerts(countryCode: string) {
    try {
      return await this.countriesRepository.getTravelAlerts(countryCode);
    } catch (error) {
      this.errorHandler.getTravelAlerts({ error, inputs: countryCode });
    }
  }
}
