import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    return await this.cacheManager.set(key, value, { ttl: ttl / 1000 } as any);
  }

  public async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get(key);
  }

  public async del(key: string): Promise<void> {
    return await this.cacheManager.del(key);
  }

  public async reset(): Promise<void> {
    return await this.cacheManager.reset();
  }
}
