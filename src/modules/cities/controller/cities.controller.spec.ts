import { Test, TestingModule } from '@nestjs/testing';
import { CitiesController } from './cities.controller';
import { CitiesService } from '../service/cities.service';
import { CitiesRepository } from '../repository/cities.repository';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';

describe('CitiesController', () => {
  let controller: CitiesController;
  let service: CitiesService;

  const mockCitiesService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository = {};

  const mockCreateCityDto = {
    cityName: 'test_city_name',
    countryCode: 'test_country_code',
  };

  const mockUpdateCityDto = {
    cityName: 'test_city_name',
    countryCode: 'test_country_code',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [
        {
          provide: CitiesService,
          useValue: mockCitiesService,
        },
        {
          provide: CitiesRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    controller = module.get<CitiesController>(CitiesController);
    service = module.get<CitiesService>(CitiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have service', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });

    it('should call service.create', () => {
      controller.create(mockCreateCityDto as CreateCityDto);

      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(controller.update).toBeDefined();
    });

    it('should call service.update', () => {
      controller.update(mockUpdateCityDto as UpdateCityDto);

      expect(service.update).toHaveBeenCalled();
    });
  });
});
