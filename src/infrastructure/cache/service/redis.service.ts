import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ICacheService } from '../interface/cache.service.interface';
import { FailedToDeleteRefreshTokenError } from '../error/failed-to-delete-refresh-token';
import { FailedToGetRefreshTokenError } from '../error/failed-to-get-refresh-token';
import { FailedToSetRefreshTokenError } from '../error/failed-to-set-refresh-token';
import { SECONDS } from '../../../common/constant/time/milliseconds-base/milliseconds-to-seconds';
import { HOURS } from '../../../common/constant/time/milliseconds-base/milliseconds-to-hours';

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

  public async setTicketSoldOut(ticketId: string): Promise<void> {
    return await this.set(`sold-out-${ticketId}`, true, 24 * HOURS);
  }

  public async getTicketSoldOut(ticketId: string): Promise<boolean> {
    return await this.get<boolean>(`sold-out-${ticketId}`);
  }

  /**
   * @description
   * 티켓 판매 상태가 초기화 되는 경우:
   * 1. queue에 작업을 추가하는데 실패한 경우
   *  - 3번까지 재시도 한 뒤 다른 유저에게 기회를 준다
   * 2. 캐싱된지 24시간이 지난 경우
   *  - 장시간 처리되지 않은 예약은 시스템 에러로 간주하고 24시간 내에 대응해야 한다
   *
   * 티켓 판매 상태가 초기화 되지 않는 경우:
   * 1. process가 작업을 처리하는데 실패한 경우
   *  - failover 로직으로 관리한다
   * 2. process가 작업을 처리하는데 성공한 경우
   *  - 별도로 초기화 하지 않아도 된다
   */
  public async deleteTicketSoldOut(ticketId: string): Promise<void> {
    return await this.del(`sold-out-${ticketId}`);
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
