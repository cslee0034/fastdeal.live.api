import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../cache/service/redis.service';
import * as httpMocks from 'node-mocks-http';
import { CookieOptions } from 'express';

describe('AuthService', () => {
  let service: AuthService;

  const mockId = 1;
  const mockEmail = 'test@email.com';

  const accessSecret = 'jwt.access.secret';
  const accessExpiresIn = '3600';

  const refreshSecret = 'jwt.refresh.secret';
  const refreshExpiresIn = '3600';

  const mockAccessToken = 'mock_access_token';
  const mockRefreshToken = 'mock_refresh_token';

  const mockTokens = {
    accessToken: mockAccessToken,
    refreshToken: mockRefreshToken,
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'jwt.access.secret') {
        return accessSecret;
      } else if (key === 'jwt.access.expiresIn') {
        return accessExpiresIn;
      } else if (key === 'jwt.refresh.secret') {
        return refreshSecret;
      } else if (key === 'jwt.refresh.expiresIn') {
        return refreshExpiresIn;
      }
    }),
  };

  interface Payload {
    userId: number;
    email: string;
  }
  interface SignOption {
    secret: string;
    expiresIn: string;
  }
  const mockJwtService = {
    signAsync: jest.fn(
      (payload: Payload, signOption: SignOption): Promise<string> => {
        const token = `${payload.userId}_${payload.email}_${signOption.secret}_${signOption.expiresIn}`;
        return Promise.resolve(token);
      },
    ),
  };

  const mockRedisService = {
    set: jest.fn(async (): Promise<void> => {
      return Promise.resolve();
    }),

    del: jest.fn(),

    get: jest.fn(),
  };

  type MockResponse = Response & {
    cookie: jest.MockedFunction<
      (name: string, val: string, options?: CookieOptions) => Response
    >;
  };

  const mockResponse: MockResponse = httpMocks.createResponse() as any;
  mockResponse.cookie = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should be defined', () => {
      expect(service.login).toBeDefined();
    });

    it('should call redis.set function', async () => {
      await service.login(mockId, mockRefreshToken);

      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should throw InternalServerException if failed', async () => {
      mockRedisService.set.mockRejectedValueOnce(
        new Error('Failed to set token'),
      );

      await expect(service.login(mockId, mockEmail)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('logout', () => {
    const userId = 0;

    it('should be defined', () => {
      expect(service.logout).toBeDefined();
    });

    it('should call redis.del function', async () => {
      await service.logout(userId);

      expect(mockRedisService.del).toHaveBeenCalledWith(
        `${mockConfigService.get('jwt.refresh.prefix')}${userId}`,
      );
    });

    it('should throw error if del function fails', async () => {
      mockRedisService.del.mockRejectedValueOnce(new Error('Failed to logout'));

      await expect(service.logout(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('generateTokens', () => {
    it('should called with signAsync function', async () => {
      await service.generateTokens(mockId, mockEmail);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockId,
          email: mockEmail,
        }),
        expect.objectContaining({
          secret: accessSecret,
          expiresIn: accessExpiresIn,
        }),
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockId,
          email: mockEmail,
        }),
        expect.objectContaining({
          secret: refreshSecret,
          expiresIn: refreshExpiresIn,
        }),
      );
    });

    it('should return token strings object', async () => {
      const tokens = await service.generateTokens(mockId, mockEmail);

      expect(tokens).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      );
    });

    it('should throw error if it fails to generate tokens', async () => {
      mockJwtService.signAsync.mockRejectedValueOnce(
        new Error('Failed to create tokens'),
      );

      await expect(service.generateTokens(mockId, mockEmail)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('setTokens', () => {
    it('should be defined', () => {
      expect(service.setTokens).toBeDefined();
    });

    it('should call response.cookie function', () => {
      service.setTokens(mockResponse as any, mockTokens);

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
    });

    it('should throw error if it fails to set tokens', async () => {
      mockResponse.cookie.mockImplementationOnce(() => {
        throw new InternalServerErrorException('Failed to set tokens');
      });

      await expect(
        service.setTokens(mockResponse as any, mockTokens),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('checkIsLoggedIn', () => {
    const userId = 1;
    const validRefreshToken = 'valid_refresh_token';
    const invalidRefreshToken = 'invalid_refresh_token';

    it('should return undefined when refresh tokens match', async () => {
      mockRedisService.get.mockResolvedValueOnce(validRefreshToken);

      await expect(
        service.checkIsLoggedIn(userId, validRefreshToken),
      ).resolves.toBeUndefined();
    });

    it('should throw UnauthorizedException when refresh tokens do not match', async () => {
      mockRedisService.get.mockResolvedValueOnce(invalidRefreshToken);

      await expect(
        service.checkIsLoggedIn(userId, validRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException if failed to get refresh token', async () => {
      mockRedisService.get.mockRejectedValueOnce(new Error('Redis error'));

      await expect(
        service.checkIsLoggedIn(userId, validRefreshToken),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
