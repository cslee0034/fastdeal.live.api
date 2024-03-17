import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const error = exception.getResponse() as
      | string
      | { statusCode: number; error: string; message: string | string[] };
    const timestamp = new Date().toISOString();

    if (typeof error === 'string') {
      this.logger.error(`
      success: false
      timestamp: ${timestamp}
      statusCode: ${statusCode}
      path: ${request.url}
      error: ${error}
      `);

      response.status(statusCode).json({
        success: false,
        timestamp: timestamp,
        statusCode: statusCode,
        path: request.url,
        error: error,
      });
    } else {
      this.logger.error(`
      success: false
      timestamp: ${timestamp}
      error: ${(error.statusCode, error.error, error.message)}
      `);

      response.status(statusCode).json({
        success: false,
        timestamp: timestamp,
        ...error,
      });
    }
  }
}
