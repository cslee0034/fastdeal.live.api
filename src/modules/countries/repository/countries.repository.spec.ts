import { Test, TestingModule } from '@nestjs/testing';
import { CountriesRepository } from './countries.repository';
import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { CountryEntity } from '../entities/country.entity';
import { AlertStatus, Continent } from '@prisma/client';
import { TravelAlertEntity } from '../entities/travel-alert.entity';

describe('CountriesRepository', () => {
  let repository: CountriesRepository;

  const mockPrismaService = {
    country: {
      create: jest.fn().mockImplementation((createCountryDto) => {
        return Promise.resolve(new CountryEntity(createCountryDto));
      }),

      findUnique: jest.fn().mockImplementation((countryCode: string) => {
        return Promise.resolve(new CountryEntity({ countryCode }));
      }),

      update: jest.fn().mockImplementation((updateCountryDto) => {
        return Promise.resolve(new CountryEntity(updateCountryDto));
      }),

      delete: jest.fn().mockImplementation((countryId: string) => {
        return Promise.resolve({
          id: countryId,
        });
      }),
    },

    travelAlert: {
      create: jest.fn().mockImplementation((travelAlert) => {
        return Promise.resolve(new TravelAlertEntity(travelAlert));
      }),

      findMany: jest.fn().mockImplementation((countryCode: string) => {
        if (countryCode === 'KR') {
          return Promise.resolve([new TravelAlertEntity({})]);
        }
        return Promise.resolve([]);
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<CountriesRepository>(CountriesRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(repository.create).toBeDefined();
    });

    it('should create a new country', async () => {
      const createCountryDto = {
        countryCode: 'KR',
        countryName: 'Korea',
        currency: 'KRW',
        exchangeRate: 1200,
        continent: Continent.asia,
      };
      const result = await repository.create(createCountryDto);

      expect(result).toBeInstanceOf(CountryEntity);
      expect(mockPrismaService.country.create).toHaveBeenCalledWith({
        data: createCountryDto,
      });
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(repository.update).toBeDefined();
    });

    it('should update a country', async () => {
      const updateCountryDto = {
        id: 'test_country_id',
        countryCode: 'KR',
        countryName: 'Korea',
        currency: 'KRW',
        exchangeRate: 1200,
        continent: Continent.asia,
      };

      const result = await repository.update(updateCountryDto);

      expect(result).toBeInstanceOf(CountryEntity);
      expect(mockPrismaService.country.update).toHaveBeenCalledWith({
        where: { id: updateCountryDto.id },
        data: updateCountryDto,
      });
    });
  });

  describe('delete', () => {
    it('should be defined', () => {
      expect(repository.delete).toBeDefined();
    });

    it('should delete a country', async () => {
      const id = 'test_country_id';
      await repository.delete(id);

      expect(mockPrismaService.country.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('createTravelAlert', () => {
    it('should be defined', () => {
      expect(repository.createTravelAlert).toBeDefined();
    });

    it('should create a travel alert', async () => {
      const travelAlert = {
        nationalityCode: 'KR',
        destinationCode: 'US',
        alertStatus: AlertStatus.green,
      };
      const result = await repository.createTravelAlert(travelAlert);

      expect(result).toBeInstanceOf(TravelAlertEntity);
    });
  });

  describe('getTravelAlerts', () => {
    it('should be defined', () => {
      expect(repository.getTravelAlerts).toBeDefined();
    });

    it('should get travel alerts', async () => {
      const countryCode = 'KR';
      await repository.getTravelAlerts(countryCode);

      expect(mockPrismaService.travelAlert.findMany).toHaveBeenCalledWith;
    });
  });
});
