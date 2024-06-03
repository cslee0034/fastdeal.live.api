import { Injectable } from '@nestjs/common';
import { CitiesRepository } from '../repository/cities.repository';
import { CreateCityDto } from '../dto/create-city.dto';
import { CitiesErrorHandler } from '../error/handler/cities.error.handler';

@Injectable()
export class CitiesService {
  constructor(
    private readonly citiesRepository: CitiesRepository,
    private readonly errorHandler: CitiesErrorHandler,
  ) {}

  async create(CreateCityDto: CreateCityDto) {
    try {
      return await this.citiesRepository.create(CreateCityDto);
    } catch (error) {
      this.errorHandler.create({ error, inputs: CreateCityDto });
    }
  }
}
