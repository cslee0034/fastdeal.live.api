import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { RedisService } from './redis.service';
import { FailedToGetRefreshTokenError } from '../error/failed-to-get-refresh-token';
import { FailedToDeleteRefreshTokenError } from '../error/failed-to-delete-refresh-token';
import { FailedToSetRefreshTokenError } from '../error/failed-to-set-refresh-token';

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

      expect(cacheManager.set).toHaveBeenCalledWith(mockId, mockToken, mockTtl);
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

  describe('reset', () => {
    it('캐시를 리셋한다', async () => {
      // private method 호출
      await service['reset']();

      expect(cacheManager.reset).toHaveBeenCalled();
    });
  });
});
