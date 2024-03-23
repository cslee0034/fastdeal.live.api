import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../cache/service/redis.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockConfigService = {
    get: jest.fn((key: string): number | string => {
      if (typeof key === 'string') {
        return key;
      }

      return key;
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
  };

  const mockId = 1;
  const mockEmail = 'test@email.com';
  const accessSecret = 'jwt.access.secret';
  const accessExpiresIn = 'jwt.access.expiresIn';
  const refreshSecret = 'jwt.refresh.secret';
  const refreshExpiresIn = 'jwt.refresh.expiresIn';
  const testLoginToken = 'test_token';

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
      await service.login(mockId, testLoginToken);

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

  describe('generateToken', () => {
    it('should called with signAsync function', async () => {
      await service.generateToken(mockId, mockEmail);

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
      const tokens = await service.generateToken(mockId, mockEmail);

      expect(tokens).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      );
    });

    it('should throw error if it fails to generate token', async () => {
      mockJwtService.signAsync.mockRejectedValueOnce(
        new Error('Failed to create token'),
      );

      await expect(service.generateToken(mockId, mockEmail)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
