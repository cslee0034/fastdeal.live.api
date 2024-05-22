import { Prisma } from '@prisma/client';
import { PrismaErrorHandler } from './prisma.error.handler';
import { Logger } from 'winston';

describe('PrismaErrorHandler', () => {
  let prismaErrorHandler: PrismaErrorHandler;
  const logger = {
    query: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  } as unknown as Logger;

  beforeEach(() => {
    prismaErrorHandler = new PrismaErrorHandler(logger);
  });

  describe('handlePrismaError', () => {
    it('should throw Prisma.PrismaClientKnownRequestError', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the email',
        {
          code: 'P2002',
          meta: {
            target: ['email'],
            value: '',
          },
        } as any,
      );

      expect(() => prismaErrorHandler.handlePrismaError(error)).toThrow(error);
    });

    it('should throw Prisma.PrismaClientValidationError', () => {
      const error = new Prisma.PrismaClientValidationError('', {
        meta: {
          target: [''],
          value: '',
        },
      } as any);

      expect(() => prismaErrorHandler.handlePrismaError(error)).toThrow(error);
    });

    it('should throw Prisma.PrismaClientInitializationError', () => {
      const error = new Prisma.PrismaClientInitializationError('', {
        meta: {
          target: [''],
          value: '',
        },
      } as any);

      expect(() => prismaErrorHandler.handlePrismaError(error)).toThrow(error);
    });

    it('should throw Prisma.PrismaClientRustPanicError', () => {
      const error = new Prisma.PrismaClientRustPanicError('', {
        meta: {
          target: [''],
          value: '',
        },
      } as any);

      expect(() => prismaErrorHandler.handlePrismaError(error)).toThrow(error);
    });

    it('should not throw error', () => {
      const error = new Error('Unexpected error');

      expect(() => prismaErrorHandler.handlePrismaError(error)).not.toThrow();
    });
  });

  describe('logInputs', () => {
    it('should be defined', () => {
      expect(prismaErrorHandler.logInputs).toBeDefined();
    });

    it('should log inputs', () => {
      const inputs = '';

      prismaErrorHandler.logInputs(inputs);

      expect(logger.error).toHaveBeenCalledWith(
        `\ninputs: ${JSON.stringify(inputs, null, 2)}`,
      );
    });
  });
});
