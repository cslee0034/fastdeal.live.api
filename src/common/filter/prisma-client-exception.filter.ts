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
  environment: string;
  success: boolean;
  timestamp: string;
  path: string;
  statusCode: number;
  error: string;
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
      const KSTDate = new Date().toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
      });

      const message = this.formatMessage({
        request,
        statusCode,
        KSTDate,
        error,
      });

      this.logMessage(message);

      const clientMessage = this.formatClientMessage(message);

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(clientMessage);
    }
  }

  private formatMessage = ({
    request,
    statusCode,
    KSTDate,
    error,
  }: {
    request: Request;
    statusCode: number;
    KSTDate: string;
    error: ErrorType;
  }): IMessage => {
    return {
      environment: process.env.NODE_ENV,
      success: false,
      timestamp: KSTDate,
      path: request.url,
      statusCode: statusCode,
      error: JSON.stringify(error, null, 2),
      message: error?.message || 'Priam Client Error',
    };
  };

  private logMessage = (message: object): void => {
    this.logger.error(this.messageToString(message));

    if (process.env.NODE_ENV === 'production') {
      this.slack.send(this.messageToString(message));
    }

    return;
  };

  private messageToString = (message: object): string => {
    let logString = '';
    for (const [key, value] of Object.entries(message)) {
      logString += `\n${key}: ${value}`;
    }

    return logString;
  };

  private formatClientMessage = (message: IMessage): IMessage => {
    return {
      ...message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        'An error occurred while processing your request. Please try again later',
      error: '',
    };
  };
}
