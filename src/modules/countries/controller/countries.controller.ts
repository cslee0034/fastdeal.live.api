import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CountriesService } from '../service/countries.service';
import { Roles } from '../../../common/decorator/roles.decorator';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CountryEntity } from '../entities/country.entity';
import { COUNTRIES_ERROR } from '../error/constant/countries.error.constant';
import { TravelAlertEntity } from '../entities/travel-alert.entity';
import { CreateTravelAlertDto } from '../dto/create-travel-alert.dto';
import { Public } from '../../../common/decorator/public.decorator';

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
  @ApiInternalServerErrorResponse({
    description: COUNTRIES_ERROR.CANNOT_CREATE_COUNTRY,
  })
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.create(createCountryDto);
  }

  @Roles(['admin'])
  @Patch()
  @ApiOperation({ summary: 'Update a country' })
  @ApiOkResponse({
    description: 'The country has been successfully updated.',
    type: CountryEntity,
  })
  @ApiInternalServerErrorResponse({
    description: COUNTRIES_ERROR.CANNOT_UPDATE_COUNTRY,
  })
  update(@Body() updateCountryDto: UpdateCountryDto) {
    return this.countriesService.update(updateCountryDto);
  }

  @Roles(['admin'])
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a country' })
  @ApiOkResponse({
    description: 'The country has been successfully deleted.',
    type: CountryEntity,
  })
  @ApiInternalServerErrorResponse({
    description: COUNTRIES_ERROR.CANNOT_DELETE_COUNTRY,
  })
  delete(@Param('code') code: string) {
    return this.countriesService.delete(code);
  }

  @Roles(['admin'])
  @Post('travel-alert')
  @ApiOperation({ summary: 'Create a travel alert' })
  @ApiCreatedResponse({
    description: 'The travel alert has been successfully created.',
    type: TravelAlertEntity,
  })
  @ApiInternalServerErrorResponse({
    description: COUNTRIES_ERROR.CANNOT_CREATE_TRAVEL_ALERT,
  })
  createTravelAlert(@Body() travelAlert: CreateTravelAlertDto) {
    return this.countriesService.createTravelAlert(travelAlert);
  }

  @Public()
  @Get('travel-alert')
  @ApiOperation({ summary: 'Get travel alerts by country code' })
  @ApiOkResponse({
    description: 'The travel alerts have been successfully retrieved.',
    type: [TravelAlertEntity],
  })
  @ApiInternalServerErrorResponse({
    description: COUNTRIES_ERROR.CANNOT_GET_TRAVEL_ALERTS,
  })
  getTravelAlerts(countryCode: string) {
    return this.countriesService.getTravelAlerts(countryCode);
  }
}
