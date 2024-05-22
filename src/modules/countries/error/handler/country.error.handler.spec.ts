import { Test, TestingModule } from '@nestjs/testing';
import { CountriesErrorHandler } from './country.error.handler';
import { ThrownErrorHandler } from '../../../../common/error/handler/thrown.error.handler';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateCountryDto } from '../../dto/create-country.dto';
import { UpdateCountryDto } from '../../dto/update-country.dto';
import { AlertStatus } from '@prisma/client';
import { CreateTravelAlertDto } from '../../dto/create-travel-alert.dto';

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
    fromCountryId: '1',
    ...mockCreateCountryDto,
  } as UpdateCountryDto;

  const mockCreateTravelAlertDto = {
    nationalityCode: 'KR',
    destinationCode: 'US',
    alertStatus: AlertStatus.green,
  } as CreateTravelAlertDto;

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
    expect(countriesErrorHandler).toBeInstanceOf(ThrownErrorHandler);
  });

  it('should be an instance of UserErrorHandler', () => {
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

      try {
        countriesErrorHandler.create({
          error,
          inputs,
        });
      } catch (error) {}

      expect(logger.error).toHaveBeenCalled();
    });

    it('should call handleThrownError', () => {
      const error = mockError;
      const inputs = mockCreateCountryDto;

      const handleThrownErrorSpy = jest.spyOn(
        ThrownErrorHandler.prototype as any,
        'handleThrownError',
      );

      try {
        countriesErrorHandler.create({ error, inputs });
      } catch (error) {}

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

      try {
        countriesErrorHandler.update({
          error,
          inputs,
        });
      } catch (error) {}

      expect(logger.error).toHaveBeenCalled();
    });

    it('should call handlePrismaError', () => {
      const error = mockError;
      const inputs = mockUpdateCountryDto;

      const handlePrismaErrorSpy = jest.spyOn(
        ThrownErrorHandler.prototype as any,
        'handleThrownError',
      );

      try {
        countriesErrorHandler.update({ error, inputs });
      } catch (error) {}

      expect(handlePrismaErrorSpy).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should be defined', () => {
      expect(countriesErrorHandler.delete).toBeDefined();
    });

    it('should log inputs', () => {
      const error = mockError;
      const inputs = mockUpdateCountryDto;

      try {
        countriesErrorHandler.delete({
          error,
          inputs,
        });
      } catch (error) {}

      expect(logger.error).toHaveBeenCalled();
    });

    it('should call handleThrownError', () => {
      const error = mockError;
      const inputs = mockUpdateCountryDto;

      const handleThrownErrorSpy = jest.spyOn(
        ThrownErrorHandler.prototype as any,
        'handleThrownError',
      );

      try {
        countriesErrorHandler.delete({ error, inputs });
      } catch (error) {}

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

      try {
        countriesErrorHandler.createTravelAlert({
          error,
          inputs,
        });
      } catch (error) {}

      expect(logger.error).toHaveBeenCalled();
    });

    it('should call handleThrownError', () => {
      const error = mockError;
      const inputs = mockCreateTravelAlertDto;

      const handleThrownErrorSpy = jest.spyOn(
        ThrownErrorHandler.prototype as any,
        'handleThrownError',
      );

      try {
        countriesErrorHandler.createTravelAlert({ error, inputs });
      } catch (error) {}

      expect(handleThrownErrorSpy).toHaveBeenCalled();
    });
  });

  describe('getTravelAlerts', () => {
    it('should be defined', () => {
      expect(countriesErrorHandler.getTravelAlerts).toBeDefined();
    });

    it('should log inputs', () => {
      const error = mockError;
      const inputs = mockGetTravelAlertsDto;

      try {
        countriesErrorHandler.getTravelAlerts({
          error,
          inputs,
        });
      } catch (error) {}

      expect(logger.error).toHaveBeenCalled();
    });

    it('should call handleThrownError', () => {
      const error = mockError;
      const inputs = mockGetTravelAlertsDto;

      const handleThrownErrorSpy = jest.spyOn(
        ThrownErrorHandler.prototype as any,
        'handleThrownError',
      );

      try {
        countriesErrorHandler.getTravelAlerts({ error, inputs });
      } catch (error) {}

      expect(handleThrownErrorSpy).toHaveBeenCalled();
    });
  });
});
