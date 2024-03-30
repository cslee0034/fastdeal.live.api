import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Prisma } from '@prisma/client';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('PrismaClientExceptionFilter', () => {
  let prismaClientExceptionFilter: PrismaClientExceptionFilter;
  let logger: Logger;

  const timestamp = new Date().toISOString();

  const mockResponse = {
    success: false as boolean,
    timestamp: timestamp as string,
    statusCode: 0 as number,
    path: '' as string,
    errorCode: '' as string | object,
    message: '' as string,

    status: jest.fn().mockImplementation(function (status) {
      this.statusCode = status;
      return this;
    }),

    json: jest.fn().mockImplementation(function ({
      success,
      timestamp,
      path,
      error,
    }) {
      this.success = success;
      this.timestamp = timestamp;
      this.path = path;
      this.errorCode = error?.code;
      this.message = error?.message || 'Priam Client Error';

      return this;
    }),
  };

  /**
   * https://www.prisma.io/docs/orm/reference/error-reference#error-codes
   */
  const mockException = new Prisma.PrismaClientKnownRequestError(
    'Unique constraint failed on the email',
    {
      code: 'P2002',
      meta: {
        target: ['email'],
        value: '',
      },
    } as any,
  );

  const mockExecutionContext = createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({}),
      getResponse: () => mockResponse,
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaClientExceptionFilter,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            error: jest.fn().mockImplementation((text) => {
              console.log(text);
            }),
          },
        },
      ],
    }).compile();

    prismaClientExceptionFilter = module.get<PrismaClientExceptionFilter>(
      PrismaClientExceptionFilter,
    );
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(prismaClientExceptionFilter).toBeDefined();
  });

  it('should call logger.error', () => {
    prismaClientExceptionFilter.catch(mockException, mockExecutionContext);

    expect(logger.error).toHaveBeenCalled();
  });

  it('should send proper response', () => {
    prismaClientExceptionFilter.catch(mockException, mockExecutionContext);
    const statusCode = 409;

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: statusCode,
        errorCode: 'P2002',
        message: 'Unique constraint failed on the email',
      }),
    );
  });

  it('should return UNKNOWN_ERROR when error.code is not provided', () => {
    const mockException = new Prisma.PrismaClientValidationError(
      'Unique constraint failed on the email',
      {
        meta: {
          target: ['email'],
          value: '',
        },
      } as any,
    );
    const statusCode = 500;

    prismaClientExceptionFilter.catch(mockException, mockExecutionContext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: statusCode,
        errorCode: 'UNKNOWN_ERROR',
        message: 'Unique constraint failed on the email',
      }),
    );
  });
});
