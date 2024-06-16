import { Test, TestingModule } from '@nestjs/testing';
import { CitiesService } from '../service/cities.service';
import { CitiesRepository } from '../repository/cities.repository';
import { CreateCityDto } from '../dto/create-city.dto';
import { CitiesErrorHandler } from '../error/handler/cities.error.handler';
import { UpdateCityDto } from '../dto/update-city.dto';
import { CityEntity } from '../entities/city.entity';

describe('CitiesService', () => {
  let service: CitiesService;
  let repository: any;
  let errorHandler: any;

  const mockCitiesRepository = {
    create: jest.fn(),
    findMany: jest.fn().mockImplementation((cityName: string) => {
      return [
        {
          cityName,
          countryCode: 'test_country_code',
        },
      ];
    }),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCitiesErrorHandler = {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

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

    it('should return a city instance', async () => {
      const result = await service.create(mockCreateCityDto as CreateCityDto);

      expect(result).toBeInstanceOf(CityEntity);
    });

    it('should call errorHandler if it fails to create city', async () => {
      repository.create.mockRejectedValueOnce(
        new Error('Failed to create city'),
      );

      await service.create(mockCreateCityDto as CreateCityDto);

      expect(errorHandler.create).toHaveBeenCalled();
    });
  });

  describe('findMany', () => {
    it('should be defined', () => {
      expect(service.findMany).toBeDefined();
    });

    it('should call repository findOne', async () => {
      await service.findMany('test_city_name');
      expect(repository.findMany).toHaveBeenCalled();
    });

    it('should return a city instance list', async () => {
      const result = await service.findMany('test_city_name');

      expect(result).toBeInstanceOf(Array);
    });

    it('should call errorHandler if it fails to create city', async () => {
      repository.findMany.mockRejectedValueOnce(
        new Error('Failed to create city'),
      );

      await service.findMany('test_city_name');

      expect(errorHandler.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(service.update).toBeDefined();
    });

    it('should call repository update', async () => {
      await service.update(mockUpdateCityDto as UpdateCityDto);
      expect(repository.update).toHaveBeenCalled();
    });

    it('should return a city instance', async () => {
      const result = await service.update(mockUpdateCityDto as UpdateCityDto);

      expect(result).toBeInstanceOf(CityEntity);
    });

    it('should call errorHandler if it fails to create city', async () => {
      repository.update.mockRejectedValueOnce(
        new Error('Failed to create city'),
      );

      await service.update(mockUpdateCityDto as UpdateCityDto);

      expect(errorHandler.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should be defined', () => {
      expect(service.delete).toBeDefined();
    });

    it('should call repository delete', async () => {
      await service.delete('test_city_name');
      expect(repository.delete).toHaveBeenCalled();
    });

    it('should return a city instance', async () => {
      const result = await service.delete('test_city_name');

      expect(result).toBeInstanceOf(CityEntity);
    });

    it('should call errorHandler if it fails to create city', async () => {
      repository.delete.mockRejectedValueOnce(
        new Error('Failed to create city'),
      );

      await service.delete('test_city_name');

      expect(errorHandler.delete).toHaveBeenCalled();
    });
  });
});
