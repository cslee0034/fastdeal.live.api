import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Prisma } from '@prisma/client';
import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('PrismaClientExceptionFilter', () => {
  let prismaClientExceptionFilter: PrismaClientExceptionFilter;
  let logger: Logger;
  let slack: any;

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
        {
          provide: 'SLACK_TOKEN',
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    prismaClientExceptionFilter = module.get<PrismaClientExceptionFilter>(
      PrismaClientExceptionFilter,
    );
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
    slack = module.get('SLACK_TOKEN');
    process.env.NODE_ENV = 'development';
  });

  it('should be defined', () => {
    expect(prismaClientExceptionFilter).toBeDefined();
  });

  it('should call logger.error', () => {
    prismaClientExceptionFilter.catch(mockException, mockExecutionContext);

    expect(logger.error).toHaveBeenCalled();
  });

  it('should cover PrismaClientValidationError', () => {
    const mockException = new Prisma.PrismaClientValidationError('', {
      meta: {
        target: [''],
        value: '',
      },
    } as any);

    prismaClientExceptionFilter.catch(mockException, mockExecutionContext);

    expect(logger.error).toHaveBeenCalled();
  });

  it('should cover PrismaClientInitializationError', () => {
    const mockException = new Prisma.PrismaClientInitializationError('', {
      meta: {
        target: [''],
        value: '',
      },
    } as any);

    prismaClientExceptionFilter.catch(mockException, mockExecutionContext);

    expect(logger.error).toHaveBeenCalled();
  });

  it('should cover PrismaClientRustPanicError', () => {
    const mockException = new Prisma.PrismaClientRustPanicError('', {
      meta: {
        target: [''],
        value: '',
      },
    } as any);

    prismaClientExceptionFilter.catch(mockException, mockExecutionContext);

    expect(logger.error).toHaveBeenCalled();
  });

  it('should return "Priam Client Error" if error.message is not provided', () => {
    const mockException = new Prisma.PrismaClientKnownRequestError('', {
      code: 'P2002',
      meta: {
        target: ['email'],
        value: '',
      },
    } as any);

    prismaClientExceptionFilter.catch(mockException, mockExecutionContext);

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Priam Client Error'),
    );
  });

  it('should send proper response', () => {
    prismaClientExceptionFilter.catch(mockException, mockExecutionContext);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        errorCode: 'P2002',
        message:
          'An error occurred while processing your request. Please try again later',
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

    prismaClientExceptionFilter.catch(mockException, mockExecutionContext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'UNKNOWN_ERROR',
        message:
          'An error occurred while processing your request. Please try again later',
      }),
    );
  });

  it('should call slack.send if env is production', () => {
    process.env.NODE_ENV = 'production';

    prismaClientExceptionFilter.catch(mockException, mockExecutionContext);

    expect(slack.send).toHaveBeenCalled();
  });
});
