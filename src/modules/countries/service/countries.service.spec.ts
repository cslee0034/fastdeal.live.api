import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { CountryEntity } from '../entities/country.entity';
import { CreateCountryDto } from '../dto/create-country.dto';
import { CountriesRepository } from '../repository/countries.repository';
import { AlertStatus, Continent } from '@prisma/client';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { CreateTravelAlertDto } from '../dto/create-travel-alert.dto';
import { TravelAlertEntity } from '../entities/travel-alert.entity';
import { CountriesErrorHandler } from '../error/handler/countries.error.handler';

describe('CountriesService', () => {
  let service: CountriesService;
  let repository: CountriesRepository;
  let errorHandler: any;

  const mockCreateCountryDto = {
    countryCode: 'KR',
    countryName: 'Korea',
    currency: 'KRW',
    exchangeRate: 1200,
  } as CreateCountryDto;

  const mockUpdateCountryDto = {
    fromCountryId: '1',
    ...mockCreateCountryDto,
  } as UpdateCountryDto;

  const mockCreateTravelAlertDto = {
    nationalityCode: 'KR',
    destinationCode: 'US',
    alertStatus: AlertStatus.green,
  } as CreateTravelAlertDto;

  const mockCountriesRepository = {
    create: jest
      .fn()
      .mockImplementation((createCountryDto: CreateCountryDto) => {
        if (createCountryDto.countryCode === 'EXISTING_COUNTRY_CODE') {
          return Promise.reject(new Error());
        }

        return Promise.resolve(new CountryEntity(createCountryDto));
      }),

    findOneByCountryCode: jest
      .fn()
      .mockImplementation((countryCode: string) => {
        if (countryCode === 'NOT_EXISTING_COUNTRY_CODE') {
          return Promise.resolve(null);
        }

        return Promise.resolve(new CountryEntity(mockCreateCountryDto));
      }),

    update: jest
      .fn()
      .mockImplementation((updateCountryDto: UpdateCountryDto) => {
        if (updateCountryDto.fromCountryId === 'NOT_EXISTING_COUNTRY_ID') {
          return Promise.reject(new Error());
        }

        return Promise.resolve(new CountryEntity(updateCountryDto));
      }),

    delete: jest.fn().mockImplementation((id: string) => {
      if (id === 'NOT_EXISTING_COUNTRY_ID') {
        return Promise.reject(new Error());
      }

      return Promise.resolve({ id });
    }),

    createTravelAlert: jest.fn().mockImplementation((travelAlert) => {
      if (travelAlert.nationalityCode === 'NOT_EXISTING_COUNTRY_CODE') {
        return Promise.reject(new Error());
      }
      return Promise.resolve(new TravelAlertEntity(travelAlert));
    }),

    getTravelAlerts: jest.fn().mockImplementation((countryCode: string) => {
      if (countryCode === 'NOT_EXISTING_COUNTRY_CODE') {
        return Promise.reject(new Error());
      }
      return Promise.resolve([new TravelAlertEntity(mockCreateTravelAlertDto)]);
    }),
  };
  const mockCountriesErrorHandler = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createTravelAlert: jest.fn(),
    getTravelAlerts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide: CountriesRepository,
          useValue: mockCountriesRepository,
        },
        {
          provide: CountriesErrorHandler,
          useValue: mockCountriesErrorHandler,
        },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
    repository = module.get<CountriesRepository>(CountriesRepository);
    errorHandler = module.get<CountriesErrorHandler>(CountriesErrorHandler);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(service.create).toBeDefined();
    });

    it('should call repository.create', async () => {
      await service.create(mockCreateCountryDto as CreateCountryDto);

      expect(repository.create).toHaveBeenCalledWith(mockCreateCountryDto);
    });
  });

  it('should return created country', async () => {
    const result = await service.create(
      mockCreateCountryDto as CreateCountryDto,
    );

    expect(result).toEqual(new CountryEntity(mockCreateCountryDto));
  });

  it('should call errorHandler when repository.create throws an error', async () => {
    const mockCreateCountryDto = {
      countryCode: 'EXISTING_COUNTRY_CODE',
      countryName: 'Korea',
      currency: 'KRW',
      exchangeRate: 1200,
      continent: Continent.asia,
    };

    await service.create(mockCreateCountryDto);

    expect(errorHandler.create).toHaveBeenCalled();
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(service.update).toBeDefined();
    });

    it('should call repository.update', async () => {
      await service.update(mockUpdateCountryDto as UpdateCountryDto);

      expect(repository.update).toHaveBeenCalledWith(mockUpdateCountryDto);
    });
  });

  it('should return updated country', async () => {
    const result = await service.update(
      mockUpdateCountryDto as UpdateCountryDto,
    );

    expect(result).toEqual(new CountryEntity(mockUpdateCountryDto));
  });

  it('should call errorHandler when repository.update throws an error', async () => {
    const mockUpdateCountryDto = {
      fromCountryId: 'NOT_EXISTING_COUNTRY_ID',
      countryCode: 'KR',
      countryName: 'Korea',
      currency: 'KRW',
      exchangeRate: 1200,
      continent: Continent.asia,
    };

    await service.update(mockUpdateCountryDto);

    expect(errorHandler.update).toHaveBeenCalled();
  });

  describe('delete', () => {
    it('should be defined', () => {
      expect(service.delete).toBeDefined();
    });

    it('should call repository.delete', async () => {
      await service.delete('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should call errorHandler when repository.delete throws an error', async () => {
      const mockCountryId = 'NOT_EXISTING_COUNTRY_ID';

      await service.delete(mockCountryId);

      expect(errorHandler.delete).toHaveBeenCalled();
    });
  });

  describe('createTravelAlert', () => {
    it('should be defined', () => {
      expect(service.createTravelAlert).toBeDefined();
    });

    it('should call repository.createTravelAlert', async () => {
      await service.createTravelAlert(mockCreateTravelAlertDto);

      expect(repository.createTravelAlert).toHaveBeenCalledWith(
        mockCreateTravelAlertDto,
      );
    });
  });

  it('should return created travel alert', async () => {
    const result = await service.createTravelAlert(mockCreateTravelAlertDto);

    expect(result).toEqual(new TravelAlertEntity(mockCreateTravelAlertDto));
  });

  it('should call errorHandler when repository.createTravelAlert throws an error', async () => {
    const mockCreateTravelAlertDto = {
      nationalityCode: 'NOT_EXISTING_COUNTRY_CODE',
      destinationCode: 'US',
      alertStatus: AlertStatus.green,
    } as CreateTravelAlertDto;

    await service.createTravelAlert(mockCreateTravelAlertDto);

    expect(errorHandler.createTravelAlert).toHaveBeenCalled();
  });

  describe('getTravelAlerts', () => {
    it('should be defined', () => {
      expect(service.getTravelAlerts).toBeDefined();
    });

    it('should call repository.getTravelAlerts', async () => {
      await service.getTravelAlerts('KR');

      expect(repository.getTravelAlerts).toHaveBeenCalledWith('KR');
    });

    it('should return travel alerts', async () => {
      const result = await service.getTravelAlerts('KR');

      expect(result).toEqual([new TravelAlertEntity(mockCreateTravelAlertDto)]);
    });

    it('should call errorHandler when repository.getTravelAlerts throws an error', async () => {
      const mockCountryCode = 'NOT_EXISTING_COUNTRY_CODE';

      await service.getTravelAlerts(mockCountryCode);

      expect(errorHandler.getTravelAlerts).toHaveBeenCalled();
    });
  });
});
