import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { CountriesService } from '../service/countries.service';
import { CreateCountryDto } from '../dto/create-country.dto';
import { Continent } from '@prisma/client';
import { UpdateCountryDto } from '../dto/update-country.dto';

describe('CountriesController', () => {
  let controller: CountriesController;
  let service: CountriesService;

  const mockCountriesService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockCreateCountryDto = {
    countryCode: 'KR',
    countryName: 'Korea',
    currency: 'KRW',
    exchangeRate: 1200,
    continent: Continent.asia,
  };

  const mockUpdateCountryDto = {
    fromCountryId: '1',
    ...mockCreateCountryDto,
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

  describe('update', () => {
    it('should be defined', () => {
      expect(controller.update).toBeDefined();
    });

    it('should call service.update', () => {
      controller.update(mockUpdateCountryDto as UpdateCountryDto);

      expect(service.update).toHaveBeenCalled();
    });
  });
});
