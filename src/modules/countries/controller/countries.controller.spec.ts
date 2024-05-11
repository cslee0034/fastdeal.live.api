import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { CountriesService } from '../service/countries.service';
import { CreateCountryDto } from '../dto/create-country.dto';
import { Continent } from '@prisma/client';

describe('CountriesController', () => {
  let controller: CountriesController;
  let service: CountriesService;

  const mockCountriesService = {
    create: jest.fn(),
  };

  const mockCreateCountryDto = {
    countryCode: 'KR',
    countryName: 'Korea',
    currency: 'KRW',
    exchangeRate: 1200,
    continent: Continent.asia,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [
        {
          provide: CountriesService,
          useValue: mockCountriesService,
        },
      ],
    }).compile();

    controller = module.get<CountriesController>(CountriesController);
    service = module.get<CountriesService>(CountriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });

    it('should call service.create', () => {
      controller.create(mockCreateCountryDto as CreateCountryDto);

      expect(service.create).toHaveBeenCalled();
    });
  });
});
