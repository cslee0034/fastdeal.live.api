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
import { IncomingWebhook } from '@slack/webhook';

interface IMessage {
  success: boolean;
  timestamp: string;
  path: string;
  statusCode: number;
  error: string;
  message?: string | string[];
}

interface IError {
  statusCode: number;
  error: string;
  message: string | string[];
}

type ErrorType = string | IError;

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject('SLACK_TOKEN') private readonly slack: IncomingWebhook,
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

    const message: IMessage = this.formatMessage(request, statusCode, error);

    this.logMessage(message, statusCode);

    response.status(statusCode).json(message);
  }

  private formatMessage = (
    request: Request,
    statusCode: number,
    error: ErrorType,
  ): IMessage => {
    if (typeof error === 'string') {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        path: request.url,
        statusCode,
        error,
      };
    } else {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        path: request.url,
        statusCode: statusCode,
        error: error?.error,
        message: error?.message,
      };
    }
  };

  private logMessage = (message: object, statusCode: number): void => {
    // 5xx 에러는 error 로 출력하고, 그 외에는 warn으로 출력한다.
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(this.messageToString(message));
      this.slack.send(this.messageToString(message));
    } else {
      this.logger.warn(this.messageToString(message));
    }
  };

  private messageToString = (message: object): string => {
    let logString = '';
    for (const [key, value] of Object.entries(message)) {
      logString += `\n${key}: ${value}`;
    }

    return logString;
  };
}
