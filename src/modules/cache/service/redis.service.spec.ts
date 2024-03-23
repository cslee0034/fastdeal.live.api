import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    cacheManager = module.get<Cache>('CACHE_MANAGER');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('set', () => {
    it('should call cacheManager.set with correct parameters', async () => {
      const key = 'test_key';
      const value = 'test_value';
      const ttl = 1000; // 1초
      await service.set(key, value, ttl);
      expect(cacheManager.set).toBeCalledWith(key, value, { ttl: 1 });
    });
  });

  describe('get', () => {
    it('should retrieve a value by key', async () => {
      const key = 'test_key';
      const expectedValue = 'test_value';
      jest.spyOn(cacheManager, 'get').mockResolvedValue(expectedValue);
      const result = await service.get(key);
      expect(result).toEqual(expectedValue);
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      const key = 'test_key';
      await service.del(key);
      expect(cacheManager.del).toBeCalledWith(key);
    });
  });

  describe('reset', () => {
    it('should reset cache', async () => {
      await service.reset();
      expect(cacheManager.reset).toBeCalled();
    });
  });
});
