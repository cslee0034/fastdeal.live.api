import { getCacheConfig } from './cache';
import { ConfigService } from '@nestjs/config';

jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key) => {
      switch (key) {
        case 'cache.host':
          return 'localhost';
        case 'cache.port':
          return 6379;
        case 'cache.password':
          return 'supersecret';
        case 'cache.ttl':
          return 3600;
        default:
          return null;
      }
    }),
  })),
}));

describe('getRedisConfig', () => {
  it('should return the correct redis config', async () => {
    const configService = new ConfigService();
    const redisConfig = await getCacheConfig(configService);

    expect(redisConfig).toEqual({
      isGlobal: false,
      store: expect.any(Function),
      host: 'localhost',
      port: 6379,
      password: 'supersecret',
      ttl: 3600,
    });

    expect(configService.get).toHaveBeenCalledWith('cache.host');
    expect(configService.get).toHaveBeenCalledWith('cache.port');
    expect(configService.get).toHaveBeenCalledWith('cache.password');
    expect(configService.get).toHaveBeenCalledWith('cache.ttl');
  });
});
