import { Test, TestingModule } from '@nestjs/testing';
import { TransformInterceptor } from './transform-interceptor';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor;

  const executionContext = createMock<ExecutionContext>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();

    interceptor = module.get<TransformInterceptor>(TransformInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform error response', (done) => {
    const callHandler = {
      handle: () => of(new Error('Test Error')),
    };

    const result$ = interceptor.intercept(executionContext, callHandler);
    result$.subscribe({
      next() {
        jest.fn();
      },
      error(error) {
        expect(error).toEqual(new Error('Test Error'));
        done();
      },
      complete() {
        jest.fn();
      },
    });
  });

  it('should transform null response', (done) => {
    const callHandler = {
      handle: () => of(null),
    };

    const result$ = interceptor.intercept(executionContext, callHandler);
    result$.subscribe({
      next(result) {
        expect(result).toEqual({ success: false });
        done();
      },
      error() {
        jest.fn();
      },
      complete() {
        jest.fn();
      },
    });
  });

  it('should transform undefined response', (done) => {
    const callHandler = {
      handle: () => of(undefined),
    };

    const result$ = interceptor.intercept(executionContext, callHandler);
    result$.subscribe({
      next(result) {
        expect(result).toEqual({ success: false });
        done();
      },
      error() {
        jest.fn();
      },
      complete() {
        jest.fn();
      },
    });
  });

  it('should transform successful response (object)', (done) => {
    const callHandler = {
      handle: () => of({ message: 'test' }),
    };

    const result$ = interceptor.intercept(executionContext, callHandler);
    result$.subscribe({
      next(result) {
        expect(result).toEqual({ success: true, data: { message: 'test' } });
        done();
      },
      error() {
        jest.fn();
      },
      complete() {
        jest.fn();
      },
    });
  });

  it('should transform successful response (array)', (done) => {
    const callHandler = {
      handle: () => of([{ message: 'test' }]),
    };

    const result$ = interceptor.intercept(executionContext, callHandler);
    result$.subscribe({
      next(result) {
        expect(result).toEqual({ success: true, data: [{ message: 'test' }] });
        done();
      },
      error() {
        jest.fn();
      },
      complete() {
        jest.fn();
      },
    });
  });

  it('should transform successful response (string)', (done) => {
    const callHandler = {
      handle: () => of('test'),
    };

    const result$ = interceptor.intercept(executionContext, callHandler);
    result$.subscribe({
      next(result) {
        expect(result).toEqual({ success: true, data: 'test' });
        done();
      },
      error() {
        jest.fn();
      },
      complete() {
        jest.fn();
      },
    });
  });

  it('should transform successful response with success key', (done) => {
    const callHandler = {
      handle: () => of({ success: true, message: 'test' }),
    };

    const result$ = interceptor.intercept(executionContext, callHandler);
    result$.subscribe({
      next(result) {
        expect(result).toEqual({ success: true, data: { message: 'test' } });
        done();
      },
      error() {
        jest.fn();
      },
      complete() {
        jest.fn();
      },
    });
  });
});
