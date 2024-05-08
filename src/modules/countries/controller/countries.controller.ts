import { Controller } from '@nestjs/common';
import { CountriesService } from '../service/countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}
}
