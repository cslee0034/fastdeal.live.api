import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { createMock } from '@golevelup/ts-jest';
import { MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { WinstonModule } from 'nest-winston';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './config/orm/prisma/module/prisma.module';
import { AuthModule } from './modules/auth/module/auth.module';
import { RedisModule } from './modules/cache/module/redis.module';
import { EncryptModule } from './modules/encrypt/module/encrypt.module';
import { UsersModule } from './modules/users/module/users.module';

describe('AppModule', () => {
  let appModule: AppModule;
  let httpModule: HttpModule;
  let winstonModule: WinstonModule;
  let jwtModule: JwtModule;
  let cacheModule: CacheModule;
  let prismaModule: PrismaModule;
  let authModule: AuthModule;
  let redisModule: RedisModule;
  let encryptModule: EncryptModule;
  let usersModule: UsersModule;

  const middlewareConsumer = createMock<MiddlewareConsumer>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appModule = module.get<AppModule>(AppModule);
    httpModule = module.get<HttpModule>(HttpModule);
    winstonModule = module.get<any>(WinstonModule);
    jwtModule = module.get<any>(JwtModule);
    cacheModule = module.get<CacheModule>(CacheModule);
    prismaModule = module.get<PrismaModule>(PrismaModule);
    authModule = module.get<AuthModule>(AuthModule);
    redisModule = module.get<RedisModule>(RedisModule);
    encryptModule = module.get<EncryptModule>(EncryptModule);
    usersModule = module.get<UsersModule>(UsersModule);
  });

  it('should import AppModule', async () => {
    expect(appModule).toBeDefined();
  });

  it('should import http module', () => {
    expect(httpModule).toBeDefined();
  });

  it('should import winston module', () => {
    expect(winstonModule).toBeDefined();
  });

  it('should import jwt module', () => {
    expect(jwtModule).toBeDefined();
  });

  it('should import cache module', () => {
    expect(cacheModule).toBeDefined();
  });

  it('should import prisma module', () => {
    expect(prismaModule).toBeDefined();
  });

  it('should import auth module', () => {
    expect(authModule).toBeDefined();
  });

  it('should import redis module', () => {
    expect(redisModule).toBeDefined();
  });

  it('should import encrypt module', () => {
    expect(encryptModule).toBeDefined();
  });

  it('should import users module', () => {
    expect(usersModule).toBeDefined();
  });

  it('should configure the middleware', () => {
    const app = new AppModule();
    app.configure(middlewareConsumer);
    expect(middlewareConsumer.apply).toHaveBeenCalledWith(LoggerMiddleware);
  });
});
