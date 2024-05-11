import { Test, TestingModule } from '@nestjs/testing';
import { CountriesRepository } from './countries.repository';
import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { CountryEntity } from '../entities/country.entity';

describe('CountriesRepository', () => {
  let repository: CountriesRepository;

  const mockPrismaService = {
    country: {
      create: jest.fn().mockImplementation((createCountryDto) => {
        return Promise.resolve(new CountryEntity(createCountryDto));
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
      };
      const result = await repository.create(createCountryDto);

      expect(result).toBeInstanceOf(CountryEntity);
      expect(mockPrismaService.country.create).toHaveBeenCalledWith({
        data: createCountryDto,
      });
    });
  });
});
