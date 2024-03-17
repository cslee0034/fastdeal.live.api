import { Test, TestingModule } from '@nestjs/testing';
import { LoggerMiddleware } from './logger.middleware';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Request, Response, NextFunction } from 'express';
import * as http from 'http';

describe('LoggerMiddleware', () => {
  let loggerMiddleware: LoggerMiddleware;
  let logger: Logger;

  const request = {
    ip: '127.0.0.1',
    method: 'GET',
    originalUrl: '/test',
    get: jest.fn().mockImplementation((name) => {
      if (name === 'user-agent') {
        return 'user-agent';
      }
      return undefined;
    }),
  } as unknown as Request;
  const response = new http.ServerResponse(request) as unknown as Response;
  const next = jest.fn() as NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerMiddleware,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            info: jest.fn().mockImplementation((text) => {
              console.log(text);
            }),
          },
        },
      ],
    }).compile();

    loggerMiddleware = module.get<LoggerMiddleware>(LoggerMiddleware);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(loggerMiddleware).toBeDefined();
  });

  it('should call use method with request, response, next', () => {
    loggerMiddleware.use(request, response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should have logger inside of middleware', () => {
    expect(loggerMiddleware).toHaveProperty('logger');
    expect(loggerMiddleware['logger']).toBe(logger);
  });

  it("should call response.on 'finish'", () => {
    const spyResponseOn = jest.spyOn(response, 'on');

    loggerMiddleware.use(request, response, next);

    response.emit('finish');

    expect(spyResponseOn).toHaveBeenCalledWith('finish', expect.any(Function));

    spyResponseOn.mockRestore();
  });

  it('should call logger.info when finish', async () => {
    const spyResponseOn = jest.spyOn(response, 'on');

    loggerMiddleware.use(request, response, next);

    response.emit('finish');

    expect(logger.info).toHaveBeenCalled();

    spyResponseOn.mockRestore();
  });

  it('should call logger.info when finish', async () => {
    const spyResponseOn = jest.spyOn(response, 'on');
    response.statusCode = 200;

    loggerMiddleware.use(request, response, next);

    response.emit('finish');

    const expectedLogMessage = `GET /test 200 127.0.0.1 user-agent`;

    expect(logger.info).toHaveBeenCalledWith(expectedLogMessage);

    spyResponseOn.mockRestore();
  });
});
