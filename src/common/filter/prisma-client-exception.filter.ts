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
import { IncomingWebhook } from '@slack/webhook';

interface IMessage {
  success: boolean;
  timestamp: string;
  path: string;
  statusCode: number;
  errorCode: string;
  message?: string | string[];
}

type ErrorType = any;

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
    @Inject('SLACK_TOKEN') private readonly slack: IncomingWebhook,
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

      const message = this.formatMessage(request, statusCode, errorCode, error);

      this.logMessage(message);

      response.status(statusCode).json(message);
    }
  }

  private formatMessage = (
    request: Request,
    statusCode: number,
    errorCode: string,
    error: ErrorType,
  ): IMessage => {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: statusCode,
      errorCode: errorCode,
      message: error?.message || 'Priam Client Error',
    };
  };

  private logMessage = (message: object): void => {
    this.logger.error(this.messageToString(message));
    this.slack.send(this.messageToString(message));
  };

  private messageToString = (message: object): string => {
    let logString = '';
    for (const [key, value] of Object.entries(message)) {
      logString += `\n${key}: ${value}`;
    }

    return logString;
  };
}
