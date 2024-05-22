import { Injectable } from '@nestjs/common';
import { CountriesRepository } from '../repository/countries.repository';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { CreateTravelAlertDto } from '../dto/create-travel-alert.dto';
import { CountriesErrorHandler } from '../error/handler/country.error.handler';

@Injectable()
export class CountriesService {
  constructor(
    private readonly countriesRepository: CountriesRepository,
    private readonly errorHandler: CountriesErrorHandler,
  ) {}

  public async create(createCountryDto: CreateCountryDto) {
    try {
      return await this.countriesRepository.create(createCountryDto);
    } catch (error) {
      this.errorHandler.create(error);
    }
  }

  public async update(updateCountryDto: UpdateCountryDto) {
    try {
      return await this.countriesRepository.update(updateCountryDto);
    } catch (error) {
      this.errorHandler.update(error);
    }
  }

  public async delete(id: string) {
    try {
      return await this.countriesRepository.delete(id);
    } catch (error) {
      this.errorHandler.delete(error);
    }
  }

  public async createTravelAlert(travelAlert: CreateTravelAlertDto) {
    try {
      return await this.countriesRepository.createTravelAlert(travelAlert);
    } catch (error) {
      this.errorHandler.createTravelAlert(error);
    }
  }

  public async getTravelAlerts(countryCode: string) {
    try {
      return await this.countriesRepository.getTravelAlerts(countryCode);
    } catch (error) {
      this.errorHandler.getTravelAlerts(error);
    }
  }
}
