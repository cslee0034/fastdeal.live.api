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
  environment: string;
  success: boolean;
  timestamp: string;
  path: string;
  statusCode: number;
  error: string;
  message?: string | string[];
  stack?: string;
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
    const KSTDate = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
    });

    const message: IMessage = this.formatMessage({
      request,
      statusCode,
      KSTDate,
      error,
      stack: exception.stack,
    });

    this.logMessage(message, statusCode);

    const clientMessage = this.omitStack(message);

    response.status(statusCode).json(clientMessage);
  }

  private formatMessage = ({
    request,
    statusCode,
    KSTDate,
    error,
    stack,
  }: {
    request: Request;
    statusCode: number;
    KSTDate: string;
    error: ErrorType;
    stack: string;
  }): IMessage => {
    if (typeof error === 'string') {
      return {
        environment: process.env.NODE_ENV,
        success: false,
        timestamp: KSTDate,
        path: request.url,
        statusCode,
        error,
        stack,
      };
    } else {
      return {
        environment: process.env.NODE_ENV,
        success: false,
        timestamp: KSTDate,
        path: request.url,
        statusCode: statusCode,
        error: error?.error,
        message: error?.message,
        stack,
      };
    }
  };

  private logMessage = (message: IMessage, statusCode: number): void => {
    const stringifiedMessage = this.messageToString(message);

    /**
     * 5xx 이하 에러(4xx)는 warn으로 출력한다.
     */
    if (statusCode < HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.warn(stringifiedMessage);
      return;
    }

    /**
     * 5xx 이상의 에러는 error로 출력한다.
     * slack으로 메시지를 전송하기 전에 로컬에서 에러 메시지를 출력한다.
     */
    this.logger.error(stringifiedMessage);

    /**
     * production 환경에서만 slack으로 에러 메시지를 전송한다.
     */
    if (process.env.NODE_ENV === 'production') {
      this.slack.send(stringifiedMessage);
    }

    return;
  };

  private messageToString = (message: IMessage): string => {
    let logString = '';
    for (const [key, value] of Object.entries(message)) {
      logString += `\n${key}: ${value}`;
    }

    return logString;
  };

  private omitStack = (message: IMessage): IMessage => {
    return {
      ...message,
      stack: '',
    };
  };
}
