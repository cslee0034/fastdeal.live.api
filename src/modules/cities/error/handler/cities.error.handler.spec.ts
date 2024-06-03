import { Test, TestingModule } from '@nestjs/testing';
import { BaseErrorHandler } from '../../../../common/error/handler/base.error.handler';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CitiesErrorHandler } from './cities.error.handler';

describe('CountriesErrorHandler', () => {
  let citiesErrorHandler: CitiesErrorHandler;
  let logger: Logger;

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
    expect(citiesErrorHandler).toBeInstanceOf(BaseErrorHandler);
  });

  it('should be an instance of CitiesErrorHandler', () => {
    expect(citiesErrorHandler).toBeInstanceOf(CitiesErrorHandler);
  });

  it('should have a logger instance', () => {
    expect(logger).toBeDefined();
  });
});
