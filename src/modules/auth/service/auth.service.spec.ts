import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../cache/service/redis.service';
import * as httpMocks from 'node-mocks-http';
import { UserEntity } from '../../users/entities/user.entity';
import { Response } from 'express';
import { UsersService } from '../../users/service/users.service';
import { Tokens } from '../interfaces/tokens.interface';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    convertUserResponse: jest.fn().mockImplementation((user: UserEntity) => {
      return {
        success: true,
        email: user?.email,
        provider: user?.provider || 'local',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        expiresIn: mockExpiresIn / 1000,
      };
    }),
  };

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
        case 'jwt.refresh.expiresIn':
          return mockExpiresIn;
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

  const mockRedirectError = { message: 'Failed to login' };

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

  const mockTokens = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
  } as Tokens;

  const mockTokenOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 3600,
  };

  const mockExpiresIn = 3600;

  const mockResponse: Response = httpMocks.createResponse() as any;
  mockResponse.cookie = jest.fn();
  mockResponse.redirect = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
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
      await service.login(mockUser);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw InternalServerErrorException error if generateTokens fails', async () => {
      mockJwtService.signAsync.mockRejectedValueOnce(
        new Error('Failed to create tokens'),
      );

      await expect(service.login(mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should call setRefreshTokenToRedis function', async () => {
      await service.login(mockUser);

      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException error if setRefreshTokenToRedis fails', async () => {
      mockRedisService.set.mockRejectedValueOnce(
        new Error('Failed to set token'),
      );

      await expect(service.login(mockUser)).rejects.toThrow(
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

  describe('response', () => {
    it('should be defined', () => {
      expect(service.response).toBeDefined();
    });

    it('should set tokens to response', async () => {
      await service.response({
        user: mockUser,
        tokens: mockTokens,
        response: mockResponse,
        status: 200,
      });

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'x-access-token',
        'access_token',
        mockTokenOptions,
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'x-refresh-token',
        'refresh_token',
        mockTokenOptions,
      );
    });
  });

  it('should return response with user data', async () => {
    // 메서드 체이닝을 위해 mockReturnThis() 사용
    mockResponse.status = jest.fn().mockReturnThis();
    mockResponse.json = jest.fn();

    await service.response({
      user: mockUser,
      tokens: mockTokens,
      response: mockResponse,
      status: HttpStatus.OK,
    });

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      email: mockUser.email,
      provider: mockUser.provider,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      expiresIn: mockExpiresIn / 1000,
    });
  });

  it('should throw InternalServerErrorException error if setTokensToResponse fails', async () => {
    mockResponse.cookie = jest.fn().mockImplementationOnce(() => {
      throw new Error('Failed to set tokens');
    });

    await expect(
      service.response({
        user: mockUser,
        tokens: mockTokens,
        response: mockResponse,
        status: HttpStatus.OK,
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
