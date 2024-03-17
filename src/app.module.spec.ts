import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import { createMock } from '@golevelup/ts-jest';
import { MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

describe('AppModule', () => {
  let appModule: AppModule;
  let configModule: ConfigModule;
  const middlewareConsumer = createMock<MiddlewareConsumer>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appModule = module.get<AppModule>(AppModule);
    configModule = module.get<ConfigModule>(ConfigModule);
  });

  it('should import AppModule', async () => {
    expect(appModule).toBeDefined();
  });

  it('should import config module', () => {
    expect(configModule).toBeDefined();
  });

  it('should configure the middleware', () => {
    const app = new AppModule();
    app.configure(middlewareConsumer);
    expect(middlewareConsumer.apply).toHaveBeenCalledWith(LoggerMiddleware);
  });
});
