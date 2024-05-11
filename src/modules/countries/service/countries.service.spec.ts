import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { CountryEntity } from '../entities/country.entity';
import { CreateCountryDto } from '../dto/create-country.dto';
import { CountriesRepository } from '../repository/countries.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { Continent } from '@prisma/client';

describe('CountriesService', () => {
  let service: CountriesService;
  let repository: CountriesRepository;

  const mockCreateCountryDto = {
    countryCode: 'KR',
    countryName: 'Korea',
    currency: 'KRW',
    exchangeRate: 1200,
  };

  const mockCountriesRepository = {
    create: jest
      .fn()
      .mockImplementation((createCountryDto: CreateCountryDto) => {
        if (createCountryDto.countryCode === 'EXISTING_COUNTRY_CODE') {
          return Promise.reject(new Error());
        }

        return Promise.resolve(new CountryEntity(createCountryDto));
      }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide: CountriesRepository,
          useValue: mockCountriesRepository,
        },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
    repository = module.get<CountriesRepository>(CountriesRepository);
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

  it('should throw InternalServerErrorException when repository.create throws an error', async () => {
    const mockCreateCountryDto = {
      countryCode: 'EXISTING_COUNTRY_CODE',
      countryName: 'Korea',
      currency: 'KRW',
      exchangeRate: 1200,
      continent: Continent.asia,
    };

    await expect(service.create(mockCreateCountryDto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
