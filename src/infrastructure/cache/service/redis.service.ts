import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ICacheService } from '../interface/cache.service.interface';
import { FailedToDeleteRefreshTokenError } from '../error/failed-to-delete-refresh-token';
import { FailedToGetRefreshTokenError } from '../error/failed-to-get-refresh-token';
import { FailedToSetRefreshTokenError } from '../error/failed-to-set-refresh-token';
import { SECONDS } from '../../../common/constant/milliseconds-to-seconds';

@Injectable()
export class RedisService implements ICacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  public async getRefreshToken(id: string): Promise<string | undefined> {
    return await this.get<string>(id).catch(() => {
      throw new FailedToGetRefreshTokenError();
    });
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
    return await this.set(id, token, ttl).catch(() => {
      throw new FailedToSetRefreshTokenError();
    });
  }

  public async deleteRefreshToken(id: string): Promise<void> {
    return await this.del(id).catch(() => {
      throw new FailedToDeleteRefreshTokenError();
    });
  }

  private async set(key: string, value: any, ttl?: number): Promise<void> {
    // ttl은 Milliseconds 단위로 들어오기 때문에 초 단위로 변환해서 넣어준다.
    const ttlInSecond = ttl ? Math.floor(ttl / SECONDS) : undefined;

    return await this.cacheManager.set(key, value, { ttl: ttlInSecond } as any);
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
