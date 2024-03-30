import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientRustPanicError,
)
export class PrismaClientExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super();
  }

  catch(error: Error, host: ArgumentsHost) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientRustPanicError
    ) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      const statusCode =
        error instanceof Prisma.PrismaClientKnownRequestError
          ? HttpStatus.CONFLICT
          : HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        errorCode = error?.code || 'UNKNOWN_ERROR';
      } else {
        errorCode = 'UNKNOWN_ERROR';
      }
      const message = error?.message || 'Priam Client Error';

      this.logger.error(`
        success: false,
        timestamp: ${new Date().toISOString()},
        path: ${request.url},
        statusCode: ${statusCode},
        errorCode: ${errorCode}
        message: ${message}
      `);

      response.status(statusCode).json({
        success: false,
        timestamp: new Date().toISOString(),
        path: request.url,
        statusCode: statusCode,
        errorCode: errorCode,
        message: message,
      });
    }
  }
}
