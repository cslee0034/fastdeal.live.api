import { BadRequestException, Injectable } from '@nestjs/common';
import { CitiesRepository } from '../repository/cities.repository';
import { CreateCityDto } from '../dto/create-city.dto';
import { CitiesErrorHandler } from '../error/handler/cities.error.handler';
import { UpdateCityDto } from '../dto/update-city.dto';
import { CityEntity } from '../entities/city.entity';
import { ScoreCityDto } from '../dto/score-city.dto';
import { CITIES_ERROR } from '../error/constant/cities.error';

@Injectable()
export class CitiesService {
  constructor(
    private readonly citiesRepository: CitiesRepository,
    private readonly errorHandler: CitiesErrorHandler,
  ) {}

  public async create(createCityDto: CreateCityDto) {
    try {
      return new CityEntity(await this.citiesRepository.create(createCityDto));
    } catch (error) {
      this.errorHandler.create({ error, inputs: createCityDto });
    }
  }

  public async findMany(cityName: string) {
    try {
      const cities = await this.citiesRepository.findMany(cityName);
      return cities.map((city) => new CityEntity(city));
    } catch (error) {
      this.errorHandler.findMany({ error, inputs: cityName });
    }
  }

  public async update(updateCityDto: UpdateCityDto) {
    try {
      return new CityEntity(await this.citiesRepository.update(updateCityDto));
    } catch (error) {
      this.errorHandler.update({ error, inputs: updateCityDto });
    }
  }

  public async delete(id: string) {
    try {
      return new CityEntity(await this.citiesRepository.delete(id));
    } catch (error) {
      this.errorHandler.delete({ error, inputs: id });
    }
  }

  public async createScore(scoreCityDto: ScoreCityDto) {
    try {
      await this.findCityScoreByVoterIdAndThrow(
        scoreCityDto.voterId,
        scoreCityDto.cityId,
      );

      return await this.citiesRepository.createScore(scoreCityDto);
    } catch (error) {
      this.errorHandler.createScore({ error, inputs: scoreCityDto });
    }
  }

  private async findCityScoreByVoterIdAndThrow(
    voterId: string,
    cityId: string,
  ) {
    const cityScore = await this.citiesRepository.findCityScoreByVoterId(
      voterId,
      cityId,
    );

    if (cityScore) {
      throw new BadRequestException(CITIES_ERROR.CITY_SCORE_ALREADY_EXISTS);
    }

    return;
  }
}
