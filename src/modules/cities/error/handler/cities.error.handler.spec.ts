import { Test, TestingModule } from '@nestjs/testing';
import { CommonErrorHandler } from '../../../../common/error/handler/common.error.handler';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CitiesErrorHandler } from './cities.error.handler';

describe('CountriesErrorHandler', () => {
  let citiesErrorHandler: CitiesErrorHandler;
  let logger: Logger;

  const mockCreateCityDto = {
    cityName: 'test_city_name',
    countryCode: 'test_country_code',
  };

  const mockError = new Error('Test error');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesErrorHandler,
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

    citiesErrorHandler = module.get<CitiesErrorHandler>(CitiesErrorHandler);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(citiesErrorHandler).toBeDefined();
  });

  it('should be an instance of ThrownErrorHandler', () => {
    expect(citiesErrorHandler).toBeInstanceOf(CommonErrorHandler);
  });

  it('should be an instance of CitiesErrorHandler', () => {
    expect(citiesErrorHandler).toBeInstanceOf(CitiesErrorHandler);
  });

  it('should have a logger instance', () => {
    expect(logger).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(citiesErrorHandler.create).toBeDefined();
    });

    it('should log inputs', () => {
      const error = mockError;
      const inputs = mockCreateCityDto;

      try {
        citiesErrorHandler.create({
          error,
          inputs,
        });
      } catch (error) {}

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should call handleThrownError', () => {
      const error = mockError;
      const inputs = mockCreateCityDto;

      const handleThrownErrorSpy = jest.spyOn(
        CommonErrorHandler.prototype as any,
        'handleThrownError',
      );

      try {
        citiesErrorHandler.create({ error, inputs });
      } catch (error) {}

      expect(handleThrownErrorSpy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(citiesErrorHandler.update).toBeDefined();
    });

    it('should log inputs', () => {
      const error = mockError;
      const inputs = mockCreateCityDto;

      try {
        citiesErrorHandler.update({
          error,
          inputs,
        });
      } catch (error) {}

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should call handleThrownError', () => {
      const error = mockError;
      const inputs = mockCreateCityDto;

      const handleThrownErrorSpy = jest.spyOn(
        CommonErrorHandler.prototype as any,
        'handleThrownError',
      );

      try {
        citiesErrorHandler.update({ error, inputs });
      } catch (error) {}

      expect(handleThrownErrorSpy).toHaveBeenCalled();
    });
  });
});
