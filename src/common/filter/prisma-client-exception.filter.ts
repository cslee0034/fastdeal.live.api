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
      const status =
        error instanceof Prisma.PrismaClientKnownRequestError
          ? HttpStatus.CONFLICT
          : HttpStatus.INTERNAL_SERVER_ERROR;
      let code;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        code = error.code || 'UNKNOWN_ERROR';
      } else {
        code = 'UNKNOWN_ERROR';
      }
      const message = error.message;
      const path = request.url;
      const timestamp = new Date().toISOString();

      this.logger.error(`
        Status: ${status}
        Code: ${code}
        Message: ${message}
        Timestamp: ${timestamp}
        Path: ${path}
      `);

      response.status(status).json({
        statusCode: status,
        message: message,
        error: code,
        timestamp: timestamp,
        path: path,
      });
    }
  }
}
