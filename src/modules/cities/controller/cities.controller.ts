import { Body, Controller, Post } from '@nestjs/common';
import { CitiesService } from '../service/cities.service';
import { CreateCityDto } from '../dto/create-city.dto';
import { Roles } from '../../../common/decorator/roles.decorator';
import { UpdateCityDto } from '../dto/update-city.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Roles(['admin'])
  @Post()
  create(@Body() createCityDto: CreateCityDto) {
    return this.citiesService.create(createCityDto);
  }

  @Roles(['admin'])
  @Post()
  update(@Body() updateCityDto: UpdateCityDto) {
    return this.citiesService.update(updateCityDto);
  }
}
