import { Injectable } from '@nestjs/common';
import { CountriesRepository } from '../repository/countries.repository';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { CreateTravelAlertDto } from '../dto/create-travel-alert.dto';
import { CountriesErrorHandler } from '../error/handler/countries.error.handler';
import { CountryEntity } from '../entities/country.entity';
import { TravelAlertEntity } from '../entities/travel-alert.entity';

@Injectable()
export class CountriesService {
  constructor(
    private readonly countriesRepository: CountriesRepository,
    private readonly errorHandler: CountriesErrorHandler,
  ) {}

  public async create(
    createCountryDto: CreateCountryDto,
  ): Promise<CountryEntity> {
    try {
      return new CountryEntity(
        await this.countriesRepository.create(createCountryDto),
      );
    } catch (error) {
      console.log(error);
      this.errorHandler.create({ error, inputs: createCountryDto });
    }
  }

  public async update(
    updateCountryDto: UpdateCountryDto,
  ): Promise<CountryEntity> {
    try {
      return new CountryEntity(
        await this.countriesRepository.update(updateCountryDto),
      );
    } catch (error) {
      this.errorHandler.update({ error, inputs: updateCountryDto });
    }
  }

  public async delete(id: string): Promise<CountryEntity> {
    try {
      return new CountryEntity(await this.countriesRepository.delete(id));
    } catch (error) {
      this.errorHandler.delete({ error, inputs: id });
    }
  }

  public async createTravelAlert(
    travelAlert: CreateTravelAlertDto,
  ): Promise<TravelAlertEntity> {
    try {
      return new TravelAlertEntity(
        await this.countriesRepository.createTravelAlert(travelAlert),
      );
    } catch (error) {
      this.errorHandler.createTravelAlert({ error, inputs: travelAlert });
    }
  }

  public async findManyTravelAlerts(
    countryCode: string,
  ): Promise<TravelAlertEntity[]> {
    try {
      const alerts =
        await this.countriesRepository.findManyTravelAlerts(countryCode);
      return alerts.map((alert) => new TravelAlertEntity(alert));
    } catch (error) {
      this.errorHandler.findManyTravelAlerts({ error, inputs: countryCode });
    }
  }
}
