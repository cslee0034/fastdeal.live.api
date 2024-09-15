import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { RedisService } from './redis.service';
import { FailedToGetRefreshTokenError } from '../error/failed-to-get-refresh-token';
import { FailedToDeleteRefreshTokenError } from '../error/failed-to-delete-refresh-token';
import { FailedToSetRefreshTokenError } from '../error/failed-to-set-refresh-token';
import { SECONDS } from '../../../common/constant/time/milliseconds-base/milliseconds-to-seconds';
import { HOURS } from '../../../common/constant/time/milliseconds-base/milliseconds-to-hours';

describe('RedisService', () => {
  let service: RedisService;
  let cacheManager: Cache;

  const mockCacheManager = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
  };

  const mockId = 'testId';
  const mockToken = 'testToken';
  const mockTtl = 3600;
  const mockTicketId = '54e1c4f-a709-4d80-b9fb-5d9bdd096eec';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'CACHE_MANAGER',
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    cacheManager = module.get<Cache>('CACHE_MANAGER');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRefreshToken', () => {
    it('캐시 저장소에서 refresh token을 가져온다', async () => {
      mockCacheManager.get.mockResolvedValueOnce(mockToken);

      const result = await service.getRefreshToken(mockId);

      expect(result).toBe(mockToken);
      expect(cacheManager.get).toHaveBeenCalledWith(mockId);
    });

    it('캐시 저장소에서 refresh token을 가져오는 것에 실패하면 FailedToGetRefreshTokenError를 반환 한다', async () => {
      mockCacheManager.get.mockRejectedValueOnce(new Error());

      await expect(service.getRefreshToken(mockId)).rejects.toThrow(
        FailedToGetRefreshTokenError,
      );
    });
  });

  describe('setRefreshToken', () => {
    it('캐시 저장소에 refresh token을 저장한다', async () => {
      await service.setRefreshToken({
        id: mockId,
        token: mockToken,
        ttl: mockTtl,
      });

      expect(cacheManager.set).toHaveBeenCalledWith(mockId, mockToken, {
        ttl: Math.floor(mockTtl / 1000),
      });
    });

    it('캐시 저장소에 refresh token을 저장하는 것에 실패하면 FailedToSetRefreshTokenError를 던져야 한다', async () => {
      mockCacheManager.set.mockRejectedValueOnce(new Error());

      await expect(
        service.setRefreshToken({
          id: mockId,
          token: mockToken,
          ttl: mockTtl,
        }),
      ).rejects.toThrow(FailedToSetRefreshTokenError);
    });
  });

  describe('deleteRefreshToken', () => {
    it('캐시 저장소에서 refresh token을 삭제한다', async () => {
      await service.deleteRefreshToken(mockId);

      expect(cacheManager.del).toHaveBeenCalledWith(mockId);
    });

    it('캐시 저장소에서 refresh token을 삭제하는 것에 실패하면 FailedToDeleteRefreshTokenError를 반환 한다', async () => {
      mockCacheManager.del.mockRejectedValueOnce(new Error());

      await expect(service.deleteRefreshToken(mockId)).rejects.toThrow(
        FailedToDeleteRefreshTokenError,
      );
    });
  });

  describe('setTicketSoldOut', () => {
    it('캐시 저장소에 sold-out 상태를 저장한다', async () => {
      const ttl = 24 * HOURS;
      await service.setTicketSoldOut(mockTicketId);

      expect(cacheManager.set).toHaveBeenCalledWith(
        `sold-out-${mockTicketId}`,
        true,
        { ttl: Math.floor(ttl / 1000) },
      );
    });

    it('캐시 저장소에 sold-out 상태를 저장하는 것에 실패하면 에러를 던진다', async () => {
      mockCacheManager.set.mockRejectedValueOnce(new Error());

      await expect(service.setTicketSoldOut(mockTicketId)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('getTicketSoldOut', () => {
    it('캐시 저장소에서 sold-out 상태를 가져온다', async () => {
      mockCacheManager.get.mockResolvedValueOnce(true);

      const result = await service.getTicketSoldOut(mockTicketId);

      expect(result).toBe(true);
      expect(cacheManager.get).toHaveBeenCalledWith(`sold-out-${mockTicketId}`);
    });

    it('캐시 저장소에서 sold-out 상태를 가져오지 못하면 undefined를 반환한다', async () => {
      mockCacheManager.get.mockResolvedValueOnce(undefined);

      const result = await service.getTicketSoldOut(mockTicketId);

      expect(result).toBe(undefined);
      expect(cacheManager.get).toHaveBeenCalledWith(`sold-out-${mockTicketId}`);
    });
  });

  describe('deleteTicketSoldOut', () => {
    it('캐시 저장소에서 sold-out 상태를 삭제한다', async () => {
      await service.deleteTicketSoldOut(mockTicketId);

      expect(cacheManager.del).toHaveBeenCalledWith(`sold-out-${mockTicketId}`);
    });

    it('캐시 저장소에서 sold-out 상태를 삭제하는 것에 실패하면 에러를 던진다', async () => {
      mockCacheManager.del.mockRejectedValueOnce(new Error());

      await expect(service.deleteTicketSoldOut(mockTicketId)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('set', () => {
    it('ttl이 주어지면, ttl을 초 단위로 변환하여 캐시 저장소에 저장한다', async () => {
      const mockKey = 'mockKey';
      const mockValue = 'mockValue';
      const mockTtl = 5000;

      await service['set'](mockKey, mockValue, mockTtl);

      expect(cacheManager.set).toHaveBeenCalledWith(mockKey, mockValue, {
        ttl: Math.floor(mockTtl / 1000),
      });
    });

    it('ttl이 주어지지 않으면, ttl을 설정하지 않고 캐시 저장소에 저장한다', async () => {
      const mockKey = 'mockKey';
      const mockValue = 'mockValue';

      await service['set'](mockKey, mockValue);

      expect(cacheManager.set).toHaveBeenCalledWith(mockKey, mockValue, {});
    });
  });

  describe('reset', () => {
    it('캐시를 리셋한다', async () => {
      // private method 호출
      await service['reset']();

      expect(cacheManager.reset).toHaveBeenCalled();
    });
  });
});
