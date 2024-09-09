import { ConfigService } from '@nestjs/config';
import { MurLockModuleOptions } from 'murlock';

export const getLockConfig = async (
  configService: ConfigService,
): Promise<MurLockModuleOptions> => {
  return {
    redisOptions: {
      url: configService.get<string>('lock.url'),
      password: configService.get<string>('lock.password'),
    },
    wait: configService.get<number>('wait'),
    maxAttempts: configService.get<number>('maxAttempts'),
    logLevel: 'warn',
    ignoreUnlockFail: configService.get<boolean>('ignoreUnlockFail'),
  };
};
