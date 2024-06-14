import { Test, TestingModule } from '@nestjs/testing';
import { CountriesErrorHandler } from './countries.error.handler';
import { CommonErrorHandler } from '../../../../common/error/handler/common.error.handler';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateCountryDto } from '../../dto/create-country.dto';
import { UpdateCountryDto } from '../../dto/update-country.dto';
import { AlertStatus } from '@prisma/client';
import { CreateTravelAlertDto } from '../../dto/create-travel-alert.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('CountriesErrorHandler', () => {
  let countriesErrorHandler: CountriesErrorHandler;
  let logger: Logger;

  const mockCreateCountryDto = {
    countryCode: 'KR',
    countryName: 'Korea',
    currency: 'KRW',
    exchangeRate: 1200,
  } as CreateCountryDto;

  const mockUpdateCountryDto = {
    ...mockCreateCountryDto,
  } as UpdateCountryDto;

  const mockCreateTravelAlertDto = {
    nationalityCode: 'KR',
    destinationCode: 'US',
    alertStatus: AlertStatus.green,
  } as CreateTravelAlertDto;

  const mockDeleteCountryDto = 'KR' as string;

  const mockGetTravelAlertsDto = 'KR' as string;

  const mockError = new Error('Test error');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesErrorHandler,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            error: jest.fn().mockImplementation((text) => {
              console.log(text);
            }),
            warn: jest.fn().mockImplementation((text) => {
              console.log(text);
            }),
          },
        },
      ],
    }).compile();

    countriesErrorHandler = module.get<CountriesErrorHandler>(
      CountriesErrorHandler,
    );
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(countriesErrorHandler).toBeDefined();
  });

  it('should be an instance of ThrownErrorHandler', () => {
    expect(countriesErrorHandler).toBeInstanceOf(CommonErrorHandler);
  });

  it('should be an instance of CountriesErrorHandler', () => {
    expect(countriesErrorHandler).toBeInstanceOf(CountriesErrorHandler);
  });

  it('should have a logger instance', () => {
    expect(logger).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(countriesErrorHandler.create).toBeDefined();
    });

    it('should log inputs', () => {
      const error = mockError;
      const inputs = mockCreateCountryDto;

      expect(() => {
        countriesErrorHandler.create({ error, inputs });
      }).toThrow(InternalServerErrorException);

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should call handleThrownError', () => {
      const error = mockError;
      const inputs = mockCreateCountryDto;

      const handleThrownErrorSpy = jest.spyOn(
        CommonErrorHandler.prototype as any,
        'handleThrownError',
      );

      expect(() => {
        countriesErrorHandler.create({ error, inputs });
      }).toThrow(InternalServerErrorException);

      expect(handleThrownErrorSpy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(countriesErrorHandler.update).toBeDefined();
    });

    it('should log inputs', () => {
      const error = mockError;
      const inputs = mockUpdateCountryDto;

      expect(() => {
        countriesErrorHandler.update({ error, inputs });
      }).toThrow(InternalServerErrorException);

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should call handlePrismaError', () => {
      const error = mockError;
      const inputs = mockUpdateCountryDto;

      const handlePrismaErrorSpy = jest.spyOn(
        CommonErrorHandler.prototype as any,
        'handleThrownError',
      );

      expect(() => {
        countriesErrorHandler.update({ error, inputs });
      }).toThrow(InternalServerErrorException);

      expect(handlePrismaErrorSpy).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should be defined', () => {
      expect(countriesErrorHandler.delete).toBeDefined();
    });

    it('should log inputs', () => {
      const error = mockError;
      const inputs = mockDeleteCountryDto;

      expect(() => {
        countriesErrorHandler.delete({ error, inputs });
      }).toThrow(InternalServerErrorException);

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should call handleThrownError', () => {
      const error = mockError;
      const inputs = mockDeleteCountryDto;

      const handleThrownErrorSpy = jest.spyOn(
        CommonErrorHandler.prototype as any,
        'handleThrownError',
      );

      expect(() => {
        countriesErrorHandler.delete({ error, inputs });
      }).toThrow(InternalServerErrorException);

      expect(handleThrownErrorSpy).toHaveBeenCalled();
    });
  });

  describe('createTravelAlert', () => {
    it('should be defined', () => {
      expect(countriesErrorHandler.createTravelAlert).toBeDefined();
    });

    it('should log inputs', () => {
      const error = mockError;
      const inputs = mockCreateTravelAlertDto;

      expect(() => {
        countriesErrorHandler.createTravelAlert({ error, inputs });
      }).toThrow(InternalServerErrorException);

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should call handleThrownError', () => {
      const error = mockError;
      const inputs = mockCreateTravelAlertDto;

      const handleThrownErrorSpy = jest.spyOn(
        CommonErrorHandler.prototype as any,
        'handleThrownError',
      );

      expect(() => {
        countriesErrorHandler.createTravelAlert({ error, inputs });
      }).toThrow(InternalServerErrorException);

      expect(handleThrownErrorSpy).toHaveBeenCalled();
    });
  });

  describe('getTravelAlerts', () => {
    it('should be defined', () => {
      expect(countriesErrorHandler.findManyTravelAlerts).toBeDefined();
    });

    it('should log inputs', () => {
      const error = mockError;
      const inputs = mockGetTravelAlertsDto;

      expect(() => {
        countriesErrorHandler.findManyTravelAlerts({ error, inputs });
      }).toThrow(InternalServerErrorException);

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should call handleThrownError', () => {
      const error = mockError;
      const inputs = mockGetTravelAlertsDto;

      const handleThrownErrorSpy = jest.spyOn(
        CommonErrorHandler.prototype as any,
        'handleThrownError',
      );

      expect(() => {
        countriesErrorHandler.findManyTravelAlerts({ error, inputs });
      }).toThrow(InternalServerErrorException);

      expect(handleThrownErrorSpy).toHaveBeenCalled();
    });
  });
});
