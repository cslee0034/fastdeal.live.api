import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { CountryEntity } from '../entities/country.entity';
import { CreateCountryDto } from '../dto/create-country.dto';
import { CountriesRepository } from '../repository/countries.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { Continent } from '@prisma/client';
import { UpdateCountryDto } from '../dto/update-country.dto';

describe('CountriesService', () => {
  let service: CountriesService;
  let repository: CountriesRepository;

  const mockCreateCountryDto = {
    countryCode: 'KR',
    countryName: 'Korea',
    currency: 'KRW',
    exchangeRate: 1200,
  };

  const mockUpdateCountryDto = {
    fromCountryId: '1',
    ...mockCreateCountryDto,
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

  describe('delete', () => {
    it('should be defined', () => {
      expect(service.delete).toBeDefined();
    });

    it('should call repository.delete', async () => {
      await service.delete('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw InternalServerErrorException when repository.delete throws an error', async () => {
      const mockCountryId = 'NOT_EXISTING_COUNTRY_ID';

      await expect(service.delete(mockCountryId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
