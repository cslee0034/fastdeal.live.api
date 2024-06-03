import { Test } from '@nestjs/testing';
import { CitiesModule } from './cities.module';
import { CitiesController } from '../controller/cities.controller';
import { CitiesService } from '../service/cities.service';
import { CitiesRepository } from '../repository/cities.repository';
import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { CitiesErrorHandler } from '../error/handler/cities.error.handler';

describe('CitiesModule', () => {
  let citiesModule: CitiesModule;
  let citiesController: CitiesController;
  let citiesService: CitiesService;
  let citiesRepository: CitiesRepository;
  let citiesErrorHandler: CitiesErrorHandler;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CitiesModule],
    }).compile();

    citiesModule = module.get<CitiesModule>(CitiesModule);
    citiesController = module.get<CitiesController>(CitiesController);
    citiesService = module.get<CitiesService>(CitiesService);
    citiesRepository = module.get<CitiesRepository>(CitiesRepository);
    citiesErrorHandler = module.get<CitiesErrorHandler>(CitiesErrorHandler);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(citiesModule).toBeDefined();
  });

  it('should have citiesController', () => {
    expect(citiesController).toBeDefined();
  });

  it('should have citiesService', () => {
    expect(citiesService).toBeDefined();
  });

  it('should have citiesRepository', () => {
    expect(citiesRepository).toBeDefined();
  });

  it('should have citiesErrorHandler', () => {
    expect(citiesErrorHandler).toBeDefined();
  });

  it('should have PrismaService', () => {
    expect(prismaService).toBeDefined();
  });
});
