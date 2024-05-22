import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { CountriesService } from '../service/countries.service';
import { CreateCountryDto } from '../dto/create-country.dto';
import { AlertStatus, Continent } from '@prisma/client';
import { UpdateCountryDto } from '../dto/update-country.dto';

describe('CountriesController', () => {
  let controller: CountriesController;
  let service: CountriesService;

  const mockCountriesService = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createTravelAlert: jest.fn(),
    getTravelAlerts: jest.fn(),
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

  const mockTravelAlertDto = {
    nationalityCode: 'KR',
    destinationCode: 'US',
    alertStatus: AlertStatus.green,
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

  describe('delete', () => {
    it('should be defined', () => {
      expect(controller.delete).toBeDefined();
    });

    it('should call service.delete', () => {
      controller.delete('1');

      expect(service.delete).toHaveBeenCalled();
    });
  });

  describe('createTravelAlert', () => {
    it('should be defined', () => {
      expect(controller.createTravelAlert).toBeDefined();
    });

    it('should call service.createTravelAlert', () => {
      controller.createTravelAlert(mockTravelAlertDto);

      expect(service.createTravelAlert).toHaveBeenCalled();
    });
  });

  describe('getTravelAlerts', () => {
    it('should be defined', () => {
      expect(controller.getTravelAlerts).toBeDefined();
    });

    it('should call service.getTravelAlerts', () => {
      controller.getTravelAlerts(mockTravelAlertDto.nationalityCode);

      expect(service.getTravelAlerts).toHaveBeenCalled();
    });
  });
});
