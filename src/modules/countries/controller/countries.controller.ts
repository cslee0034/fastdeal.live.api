import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CountriesService } from '../service/countries.service';
import { Roles } from '../../../common/decorator/roles.decorator';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CountryEntity } from '../entities/country.entity';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Roles(['admin'])
  @Post()
  @ApiOperation({ summary: 'Create a country' })
  @ApiCreatedResponse({
    description: 'The country has been successfully created.',
    type: CountryEntity,
  })
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.create(createCountryDto);
  }

  @Roles(['admin'])
  @Patch()
  @ApiOkResponse({
    description: 'The country has been successfully updated.',
    type: CountryEntity,
  })
  @ApiOperation({ summary: 'Update a country' })
  update(@Body() updateCountryDto: UpdateCountryDto) {
    return this.countriesService.update(updateCountryDto);
  }

  @Roles(['admin'])
  @Delete(':id')
  @ApiOkResponse({
    description: 'The country has been successfully deleted.',
    type: CountryEntity,
  })
  @ApiOperation({ summary: 'Delete a country' })
  delete(@Param('id') id: string) {
    return this.countriesService.delete(id);
  }
}
