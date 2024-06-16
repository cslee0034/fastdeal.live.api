import { Test, TestingModule } from '@nestjs/testing';
import { CitiesService } from '../service/cities.service';
import { CitiesRepository } from '../repository/cities.repository';
import { CreateCityDto } from '../dto/create-city.dto';
import { CitiesErrorHandler } from '../error/handler/cities.error.handler';
import { UpdateCityDto } from '../dto/update-city.dto';
import { CityEntity } from '../entities/city.entity';
import { CITIES_ERROR } from '../error/constant/cities.error';

describe('CitiesService', () => {
  let service: CitiesService;
  let repository: any;
  let errorHandler: any;

  const mockCitiesRepository = {
    create: jest.fn().mockImplementation((createCityDto) => {
      if (
        createCityDto.cityName === 'EXISTING_CITY' &&
        createCityDto.countryCode === 'EXISTING_COUNTRY_CODE'
      ) {
        throw new Error(CITIES_ERROR.FAILED_TO_CREATE_CITY);
      }

      return {
        ...createCityDto,
      };
    }),

    findMany: jest.fn().mockImplementation((cityName) => {
      if (cityName !== 'EXISTING_CITY') {
        throw new Error(CITIES_ERROR.FAILED_TO_FIND_CITY);
      }

      return [
        {
          cityName: 'test_city_name',
          countryCode: 'test_country_code',
        },
      ];
    }),

    update: jest.fn().mockImplementation((updateCityDto) => {
      if (
        updateCityDto.cityName !== 'EXISTING_CITY' ||
        updateCityDto.countryCode !== 'EXISTING_COUNTRY_CODE'
      ) {
        throw new Error(CITIES_ERROR.FAILED_TO_UPDATE_CITY);
      }

      return {
        ...updateCityDto,
      };
    }),

    delete: jest.fn().mockImplementation((cityName) => {
      if (cityName !== 'EXISTING_CITY') {
        throw new Error(CITIES_ERROR.FAILED_TO_DELETE_CITY);
      }

      return {
        ...mockCreateCityDto,
      };
    }),

    createScore: jest.fn(),

    findCityScoreByVoterId: jest.fn().mockImplementation((voterId, cityId) => {
      if (voterId === 'test_voter_id' && cityId === 'test_city_id') {
        return {
          voterId: 'test_voter_id',
          cityId: 'test_city_id',
        };
      }

      return null;
    }),
  };

  const mockCitiesErrorHandler = {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createScore: jest.fn(),
  };

  const mockCreateCityDto = {
    cityName: 'test_city_name',
    countryCode: 'test_country_code',
  };

  const mockUpdateCityDto = {
    cityName: 'test_city_name',
    countryCode: 'test_country_code',
  };

  const mockScoreCityDto = {
    cityId: 'test_city_id',
    voterId: 'test_voter_id',
    totalScore: 5,
    internetSpeed: 5,
    costOfLiving: 5,
    tourism: 5,
    safety: 5,
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
      const mockCreateCityDto = {
        cityName: 'EXISTING_CITY',
        countryCode: 'EXISTING_COUNTRY_CODE',
      };

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
      const result = await service.findMany('EXISTING_CITY');

      expect(result).toEqual([expect.any(CityEntity)]);
    });

    it('should call errorHandler if it fails to create city', async () => {
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
      const mockUpdateCityDto = {
        cityName: 'EXISTING_CITY',
        countryCode: 'EXISTING_COUNTRY_CODE',
      };

      const result = await service.update(mockUpdateCityDto as UpdateCityDto);

      expect(result).toBeInstanceOf(CityEntity);
    });

    it('should call errorHandler if it fails to create city', async () => {
      const mockUpdateCityDto = {
        cityName: 'NON_EXISTING_CITY',
        countryCode: 'NON_EXISTING_COUNTRY_CODE',
      };

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
      const result = await service.delete('EXISTING_CITY');

      expect(result).toBeInstanceOf(CityEntity);
    });

    it('should call errorHandler if it fails to create city', async () => {
      await service.delete('NOT_EXISTING_CITY');

      expect(errorHandler.delete).toHaveBeenCalled();
    });
  });

  describe('createScore', () => {
    it('should be defined', () => {
      expect(service.createScore).toBeDefined();
    });

    it('should call repository findCityScoreByVoterIdAndThrow', async () => {
      await service.createScore(mockScoreCityDto);

      expect(repository.findCityScoreByVoterId).toHaveBeenCalledWith(
        mockScoreCityDto.voterId,
        mockScoreCityDto.cityId,
      );
    });

    it('should call repository createScore', async () => {
      const mockScoreCityDto = {
        cityId: 'not_test_city_id',
        voterId: 'not_test_voter_id',
        totalScore: 5,
        internetSpeed: 5,
        costOfLiving: 5,
        tourism: 5,
        safety: 5,
      };

      await service.createScore(mockScoreCityDto);

      expect(repository.createScore).toHaveBeenCalledWith(mockScoreCityDto);
    });

    it('should call errorHandler if an error occurs', async () => {
      await service.createScore(mockScoreCityDto);

      expect(errorHandler.createScore).toHaveBeenCalledWith({
        error: expect.any(Error),
        inputs: mockScoreCityDto,
      });
    });
  });
});
