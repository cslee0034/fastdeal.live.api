import { Test, TestingModule } from '@nestjs/testing';
import { CitiesService } from '../service/cities.service';
import { CitiesRepository } from '../repository/cities.repository';
import { CreateCityDto } from '../dto/create-city.dto';
import { CitiesErrorHandler } from '../error/handler/cities.error.handler';

describe('CitiesService', () => {
  let service: CitiesService;
  let repository: any;
  let errorHandler: any;

  const mockCitiesRepository = {
    create: jest.fn(),
  };

  const mockCitiesErrorHandler = {
    create: jest.fn(),
  };

  const mockCreateCityDto = {
    cityName: 'test_city_name',
    countryCode: 'test_country_code',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: CitiesRepository,
          useValue: mockCitiesRepository,
        },
        {
          provide: CitiesErrorHandler,
          useValue: mockCitiesErrorHandler,
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
    repository = module.get<CitiesRepository>(CitiesRepository);
    errorHandler = module.get<CitiesErrorHandler>(CitiesErrorHandler);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have cities repository', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(service.create).toBeDefined();
    });

    it('should call repository create', async () => {
      await service.create(mockCreateCityDto);
      expect(repository.create).toHaveBeenCalled();
    });

    it('should call errorHandler if it fails to create city', async () => {
      repository.create.mockRejectedValueOnce(
        new Error('Failed to create city'),
      );

      await service.create(mockCreateCityDto as CreateCityDto);

      expect(errorHandler.create).toHaveBeenCalled();
    });
  });
});
