import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from './redis.module';
import { RedisService } from '../service/redis.service';
import { CacheModule } from '@nestjs/cache-manager';

jest.mock('../../../config/cache/cache', () => ({
  getCacheConfig: jest.fn(() => ({
    isGlobal: false,
    host: 'localhost',
    port: 6379,
    password: 'password',
    ttl: 1000,
  })),
}));

describe('RedisModule', () => {
  let redisModule: RedisModule;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule],
    }).compile();

    redisModule = module.get<CacheModule>(CacheModule);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(redisModule).toBeDefined();
  });

  it('should have RedisService', () => {
    expect(redisService).toBeDefined();
  });
});
