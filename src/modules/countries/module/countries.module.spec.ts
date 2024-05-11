import { Test } from '@nestjs/testing';
import { CountriesModule } from './countries.module';
import { CountriesController } from '../controller/countries.controller';
import { CountriesService } from '../service/countries.service';
import { CountriesRepository } from '../repository/countries.repository';

describe('CountriesModule', () => {
  let countriesModule: CountriesModule;
  let countriesController: CountriesController;
  let countriesService: CountriesService;
  let countriesRepository: CountriesRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CountriesModule],
    }).compile();

    countriesModule = module.get<CountriesModule>(CountriesModule);
    countriesController = module.get<CountriesController>(CountriesController);
    countriesService = module.get<CountriesService>(CountriesService);
    countriesRepository = module.get<CountriesRepository>(CountriesRepository);
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

  it('should have countriesRepository', () => {
    expect(countriesRepository).toBeDefined();
  });
});
