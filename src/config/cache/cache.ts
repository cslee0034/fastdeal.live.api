import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

export const getCacheConfig = async (configService: ConfigService) => {
  return {
    isGlobal: false,
    store: redisStore,
    url: configService.get<string>('cache.url'),
    password: configService.get<string>('cache.password'),
  };
};
