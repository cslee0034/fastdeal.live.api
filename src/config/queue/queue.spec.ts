import { ConfigService } from '@nestjs/config';
import { getQueueConfig } from './queue';

jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key) => {
      switch (key) {
        case 'queue.host':
          return 'redis://localhost';
        case 'queue.port':
          return 6381;
        case 'queue.password':
          return 'secret';
        default:
          return null;
      }
    }),
  })),
}));

describe('getRedisConfig', () => {
  it('should return the correct redis config', async () => {
    const configService = new ConfigService();
    const queueConfig = await getQueueConfig(configService);

    expect(queueConfig).toEqual({
      connection: {
        host: 'redis://localhost',
        port: 6381,
        password: 'secret',
      },
    });

    expect(configService.get).toHaveBeenCalledWith('queue.host');
    expect(configService.get).toHaveBeenCalledWith('queue.port');
    expect(configService.get).toHaveBeenCalledWith('queue.password');
  });
});
