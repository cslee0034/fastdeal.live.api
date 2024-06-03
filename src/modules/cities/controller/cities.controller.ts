import { Body, Controller, Post } from '@nestjs/common';
import { CitiesService } from '../service/cities.service';
import { CreateCityDto } from '../dto/create-city.dto';
import { Roles } from '../../../common/decorator/roles.decorator';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Roles(['admin'])
  @Post()
  create(@Body() createCountryDto: CreateCityDto) {
    return this.citiesService.create(createCountryDto);
  }
}
