import { ConfigService } from '@nestjs/config';
import { getLockConfig } from './lock';

jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key) => {
      switch (key) {
        case 'lock.url':
          return 'redis://localhost:6380';
        case 'lock.password':
          return 'secret';
        case 'wait':
          return 100;
        case 'maxAttempts':
          return 3;
        case 'logLevel':
          return 'warn';
        case 'ignoreUnlockFail':
          return false;
        default:
          return null;
      }
    }),
  })),
}));

describe('getRedisConfig', () => {
  it('should return the correct redis config', async () => {
    const configService = new ConfigService();
    const redisConfig = await getLockConfig(configService);

    expect(redisConfig).toEqual({
      redisOptions: { url: 'redis://localhost:6380', password: 'secret' },
      wait: 100,
      maxAttempts: 3,
      logLevel: 'warn',
      ignoreUnlockFail: false,
    });

    expect(configService.get).toHaveBeenCalledWith('lock.url');
    expect(configService.get).toHaveBeenCalledWith('lock.password');
    expect(configService.get).toHaveBeenCalledWith('wait');
    expect(configService.get).toHaveBeenCalledWith('maxAttempts');
    expect(configService.get).toHaveBeenCalledWith('ignoreUnlockFail');
  });
});
