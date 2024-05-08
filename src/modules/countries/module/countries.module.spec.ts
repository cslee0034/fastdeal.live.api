import { Test } from '@nestjs/testing';
import { CountriesModule } from './countries.module';
import { CountriesController } from '../controller/countries.controller';
import { CountriesService } from '../service/countries.service';

describe('CountriesModule', () => {
  let countriesModule: CountriesModule;
  let countriesController: CountriesController;
  let countriesService: CountriesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CountriesModule],
    }).compile();

    countriesModule = module.get<CountriesModule>(CountriesModule);
    countriesController = module.get<CountriesController>(CountriesController);
    countriesService = module.get<CountriesService>(CountriesService);
  });

  it('should be defined', () => {
    expect(countriesModule).toBeDefined();
  });

  it('should have countriesController', () => {
    expect(countriesController).toBeDefined();
  });

  it('should have countriesService', () => {
    expect(countriesService).toBeDefined();
  });
});
