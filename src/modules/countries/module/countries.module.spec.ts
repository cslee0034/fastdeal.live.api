import { Test } from '@nestjs/testing';
import { CountriesModule } from './countries.module';
import { CountriesController } from '../controller/countries.controller';
import { CountriesService } from '../service/countries.service';
import { CountriesRepository } from '../repository/countries.repository';
import { CountriesErrorHandler } from '../error/handler/countries.error.handler';
import { PrismaModule } from '../../../common/orm/prisma/module/prisma.module';

describe('CountriesModule', () => {
  let countriesModule: CountriesModule;
  let countriesController: CountriesController;
  let countriesService: CountriesService;
  let countriesRepository: CountriesRepository;
  let countriesErrorHandler: CountriesErrorHandler;
  let prismaModule: PrismaModule;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CountriesModule],
    }).compile();

    countriesModule = module.get<CountriesModule>(CountriesModule);
    countriesController = module.get<CountriesController>(CountriesController);
    countriesService = module.get<CountriesService>(CountriesService);
    countriesRepository = module.get<CountriesRepository>(CountriesRepository);
    countriesErrorHandler = module.get<CountriesErrorHandler>(
      CountriesErrorHandler,
    );
    prismaModule = module.get<PrismaModule>(PrismaModule);
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

  it('should have countriesErrorHandler', () => {
    expect(countriesErrorHandler).toBeDefined();
  });

  it('should have prisma module', () => {
    expect(prismaModule).toBeDefined();
  });
});
