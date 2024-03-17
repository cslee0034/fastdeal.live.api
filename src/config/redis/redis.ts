import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

export const getRedisConfig = async (configService: ConfigService) => {
  return {
    isGlobal: false,
    store: redisStore,
    host: configService.get<string>('cache.host'),
    port: configService.get<string>('cache.port'),
    password: configService.get<string>('cache.password'),
    ttl: configService.get<number>('cache.ttl'),
  };
};
