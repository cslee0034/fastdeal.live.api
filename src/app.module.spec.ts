import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';

describe('AppModule', () => {
  let appModule: AppModule;
  let configModule: ConfigModule;

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
});
