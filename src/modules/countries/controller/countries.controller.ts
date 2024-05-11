import { Body, Controller, Patch, Post } from '@nestjs/common';
import { CountriesService } from '../service/countries.service';
import { Roles } from '../../../common/decorator/roles.decorator';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Roles(['admin'])
  @Post()
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.create(createCountryDto);
  }

  @Roles(['admin'])
  @Patch()
  update(@Body() updateCountryDto: UpdateCountryDto) {
    return this.countriesService.update(updateCountryDto);
  }
}
