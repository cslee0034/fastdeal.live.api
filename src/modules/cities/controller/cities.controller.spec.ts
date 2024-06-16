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
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {};

  const mockCreateCityDto = {
    cityName: 'test_city_name',
    countryCode: 'test_country_code',
  };

  const mockUpdateCityDto = {
    id: 'test_city_id',
    cityName: 'test_city_name',
    countryCode: 'test_country_code',
    isAvailable: true,
  };

  const mockDeleteCityId = 'test_city_id';

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

  describe('findMany', () => {
    it('should be defined', () => {
      expect(controller.findMany).toBeDefined();
    });

    it('should call service.findOne', () => {
      controller.findMany(mockCreateCityDto.cityName);

      expect(service.findMany).toHaveBeenCalled();
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

  describe('delete', () => {
    it('should be defined', () => {
      expect(controller.delete).toBeDefined();
    });

    it('should call service.delete', () => {
      controller.delete(mockDeleteCityId);

      expect(service.delete).toHaveBeenCalled();
    });
  });
});
