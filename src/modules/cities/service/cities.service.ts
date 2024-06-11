import { Injectable } from '@nestjs/common';
import { CitiesRepository } from '../repository/cities.repository';
import { CreateCityDto } from '../dto/create-city.dto';
import { CitiesErrorHandler } from '../error/handler/cities.error.handler';
import { UpdateCityDto } from '../dto/update-city.dto';
import { CityEntity } from '../entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    private readonly citiesRepository: CitiesRepository,
    private readonly errorHandler: CitiesErrorHandler,
  ) {}

  async create(createCityDto: CreateCityDto) {
    try {
      return new CityEntity(await this.citiesRepository.create(createCityDto));
    } catch (error) {
      this.errorHandler.create({ error, inputs: createCityDto });
    }
  }

  async update(updateCityDto: UpdateCityDto) {
    try {
      return new CityEntity(await this.citiesRepository.update(updateCityDto));
    } catch (error) {
      this.errorHandler.update({ error, inputs: updateCityDto });
    }
  }
}
