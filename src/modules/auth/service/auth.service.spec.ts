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
import { UserEntity } from '../../users/entities/user.entity';
import { Response } from 'express';

describe('AuthService', () => {
  let service: AuthService;

  const mockId = '1';

  const accessSecret = 'jwt.access.secret';
  const accessExpiresIn = '3600';
  const accessPrefix = 'access_';

  const refreshSecret = 'jwt.refresh.secret';
  const refreshExpiresIn = '3600';
  const refreshPrefix = 'refresh_';

  const mockUser = new UserEntity({
    id: '1',
    email: 'test@email.com',
    provider: 'local',
    firstName: 'test_first_name',
    lastName: 'test_last_name',
  });

  const mockRedirectError = { message: 'Failed to login' };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'jwt.access.secret':
          return accessSecret;
        case 'jwt.access.expiresIn':
          return accessExpiresIn;
        case 'mockAccessPrefix':
          return accessPrefix;
        case 'jwt.refresh.secret':
          return refreshSecret;
        case 'jwt.refresh.expiresIn':
          return refreshExpiresIn;
        case 'jwt.refresh.prefix':
          return refreshPrefix;
        case 'client.url':
          return 'http://localhost:3000';
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
    set: jest.fn(),

    del: jest.fn(),

    get: jest.fn(),
  };

  const mockResponse: Response = httpMocks.createResponse() as any;
  mockResponse.cookie = jest.fn();
  mockResponse.redirect = jest.fn();

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

    it('should call generateTokens function', async () => {
      await service.login(mockUser, mockResponse);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw InternalServerErrorException error if generateTokens fails', async () => {
      mockJwtService.signAsync.mockRejectedValueOnce(
        new Error('Failed to create tokens'),
      );

      await expect(service.login(mockUser, mockResponse)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should call setRefreshTokenToRedis function', async () => {
      await service.login(mockUser, mockResponse);

      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException error if setRefreshTokenToRedis fails', async () => {
      mockRedisService.set.mockRejectedValueOnce(
        new Error('Failed to set token'),
      );

      await expect(service.login(mockUser, mockResponse)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should call setTokensToResponse function', async () => {
      await service.login(mockUser, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException error if setTokensToResponse fails', async () => {
      const mockResponse = httpMocks.createResponse() as any;
      mockResponse.cookie = jest.fn().mockImplementationOnce(() => {
        throw new InternalServerErrorException('Failed to set tokens');
      });

      await expect(service.login(mockUser, mockResponse)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('logout', () => {
    it('should be defined', () => {
      expect(service.logout).toBeDefined();
    });

    it('should call redis.del function', async () => {
      await service.logout(mockId);

      expect(mockRedisService.del).toHaveBeenCalledWith(`refresh_${mockId}`);
    });

    it('should throw error if del function fails', async () => {
      mockRedisService.del.mockRejectedValueOnce(new Error('Failed to logout'));

      await expect(service.logout(mockId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('checkIsLoggedIn', () => {
    const userId = '1';
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

  describe('redirectUser', () => {
    it('should be defined', () => {
      expect(service.redirectUser).toBeDefined();
    });

    it('should call response.redirect function', () => {
      service.redirectUser(mockResponse, mockUser);

      expect(mockResponse.redirect).toHaveBeenCalled();
    });
  });

  describe('redirectUserWithError', () => {
    it('should be defined', () => {
      expect(service.redirectUserWithError).toBeDefined();
    });

    it('should call response.redirect function', () => {
      service.redirectUserWithError(mockResponse, mockRedirectError);

      expect(mockResponse.redirect).toHaveBeenCalled();
    });
  });
});
