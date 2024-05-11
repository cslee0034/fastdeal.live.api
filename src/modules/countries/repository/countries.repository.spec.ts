import { Test, TestingModule } from '@nestjs/testing';
import { CountriesRepository } from './countries.repository';
import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { CountryEntity } from '../entities/country.entity';
import { Continent } from '@prisma/client';

describe('CountriesRepository', () => {
  let repository: CountriesRepository;

  const mockPrismaService = {
    country: {
      create: jest.fn().mockImplementation((createCountryDto) => {
        return Promise.resolve(new CountryEntity(createCountryDto));
      }),

      update: jest.fn().mockImplementation((updateCountryDto) => {
        return Promise.resolve(new CountryEntity(updateCountryDto));
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
        fromCountryId: '1',
        countryCode: 'KR',
        countryName: 'Korea',
        currency: 'KRW',
        exchangeRate: 1200,
        continent: Continent.asia,
      };

      const result = await repository.update(updateCountryDto);

      expect(result).toBeInstanceOf(CountryEntity);
      expect(mockPrismaService.country.update).toHaveBeenCalledWith({
        where: { id: updateCountryDto.fromCountryId },
        data: updateCountryDto,
      });
    });
  });
});
