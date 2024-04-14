import { getCacheConfig } from './cache';
import { ConfigService } from '@nestjs/config';

jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key) => {
      switch (key) {
        case 'cache.url':
          return 'localhost:6379';
        case 'cache.password':
          return 'supersecret';
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
      url: 'localhost:6379',
      password: 'supersecret',
    });

    expect(configService.get).toHaveBeenCalledWith('cache.url');
    expect(configService.get).toHaveBeenCalledWith('cache.password');
  });
});
