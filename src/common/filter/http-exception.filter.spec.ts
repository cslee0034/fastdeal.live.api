import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, HttpException } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let httpExceptionFilter: HttpExceptionFilter;
  let logger: Logger;

  const timestamp = new Date().toISOString();

  /**
   * function으로 정의된 함수에서의 this
   *  - 호출된 컨텍스트에 따라 결정 된다.
   *  - 메서드(객체의 프로퍼티인 함수) 호출 시 메서드 내부의 this: 해당 메서드를 호출한 객체.
   *  - 함수 호출 시 함수 내부의 this: 전역 객체 또는 undefined
   *  - 메서드(func1) 내부에서 정의된 로컬 함수(func2)는 메서드가 아니다.
   *  ex) console.log(obj) -> undefined
   *    const obj = {
   *       name: "obj",
   *       func1: function () {
   *         const func2 = function () {
   *           console.log(this.name);
   *         };
   *         func2();
   *       },
   *     };
   *
   * 화살표 함수로 정의된 함수에서의 this
   *  - 화살표 함수 내부에는 this가 존재하지 않는다.
   *  - 화살표 함수에서의 this 문법: 그 함수를 둘러싼 가장 가까운 일반 함수 또는 전역 스코프의 this.
   */
  const mockResponse = {
    success: false as boolean,
    timestamp: timestamp as string,
    statusCode: 0 as number,
    path: '' as string,
    error: '' as string | object,

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
      if (typeof error === 'string') {
        this.success = success;
        this.timestamp = timestamp;
        this.path = path;
        this.error = error;
      } else if (typeof error === 'object') {
        this.success = success;
        this.timestamp = timestamp;
        this.error = { ...error };
      }
      return this;
    }),
  };

  const mockException = new HttpException('Internal Server Error', 500);

  const mockExecutionContext = createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({}),
      getResponse: () => mockResponse,
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpExceptionFilter,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            error: jest.fn().mockImplementation((text) => {
              console.log(text);
            }),
            warn: jest.fn().mockImplementation((text) => {
              console.log(text);
            }),
          },
        },
      ],
    }).compile();

    httpExceptionFilter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(httpExceptionFilter).toBeDefined();
  });

  it('should call logger.error', () => {
    httpExceptionFilter.catch(mockException, mockExecutionContext);

    expect(logger.error).toHaveBeenCalled();
  });

  it('should send proper response', () => {
    httpExceptionFilter.catch(mockException, mockExecutionContext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        error: 'Internal Server Error',
      }),
    );
  });

  it('should handle 5xx status error with logger.error', () => {
    const statuses = [500, 501, 502, 503];
    statuses.forEach((status) => {
      const mockException = new HttpException('Error', status);
      httpExceptionFilter.catch(mockException, mockExecutionContext);
      expect(mockResponse.status).toHaveBeenCalledWith(status);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  it('should handle 4xx status error with logger.warn', () => {
    const statuses = [400, 401, 402, 403];
    statuses.forEach((status) => {
      const mockException = new HttpException('Error', status);
      httpExceptionFilter.catch(mockException, mockExecutionContext);
      expect(mockResponse.status).toHaveBeenCalledWith(status);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  it('should handle string error responses', () => {
    const stringException = new HttpException('Not Found', 404);
    httpExceptionFilter.catch(stringException, mockExecutionContext);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'Not Found',
      }),
    );
  });

  it('should handle object error responses', () => {
    const responseObject = {
      statusCode: 403,
      message: 'Forbidden',
      error: 'Access Denied',
    };
    const objectException = new HttpException(responseObject, 403);
    httpExceptionFilter.catch(objectException, mockExecutionContext);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining(responseObject),
    );
  });

  it('should default to 500 if exception has no status', () => {
    const responseObject = {
      statusCode: null,
      message: null,
      error: null,
    };

    const nullException = new HttpException(responseObject, null);
    httpExceptionFilter.catch(nullException, mockExecutionContext);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
      }),
    );
  });
});
