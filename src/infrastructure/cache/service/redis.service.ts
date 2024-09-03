import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheService } from '../interface/cache.service.interface';

@Injectable()
export class RedisService implements CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  public async getRefreshToken(id: string): Promise<string | undefined> {
    return await this.get<string>(id);
  }

  public async setRefreshToken({
    id,
    token,
    ttl,
  }: {
    id: string;
    token: string;
    ttl: number;
  }): Promise<void> {
    return await this.set(id, token, ttl);
  }

  public async deleteRefreshToken(id: string): Promise<void> {
    return await this.del(id);
  }

  private async set(key: string, value: any, ttl?: number): Promise<void> {
    return await this.cacheManager.set(key, value, ttl as any);
  }

  private async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get(key);
  }

  private async del(key: string): Promise<void> {
    return await this.cacheManager.del(key);
  }

  private async reset(): Promise<void> {
    return await this.cacheManager.reset();
  }
}
