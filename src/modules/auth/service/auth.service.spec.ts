import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../../infrastructure/cache/service/redis.service';
import { UserEntity } from '../../users/entities/user.entity';
import { Tokens } from '../interface/tokens.interface';
import { FailedToDeleteRefreshTokenError } from '../error/failed-to-delete-refresh-token';
import { FailedToGetRefreshTokenError } from '../error/failed-to-get-refresh-token';
import { FailedToSetRefreshTokenError } from '../error/failed-to-set-refresh-token';
import { FailedToCreateTokensError } from '../error/failed-to-create-tokens';

describe('AuthService', () => {
  let service: AuthService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'jwt.access.secret':
          return accessSecret;
        case 'jwt.access.expiresIn':
          return accessExpiresIn;
        case 'jwt.refresh.secret':
          return refreshSecret;
        case 'jwt.refresh.expiresIn':
          return refreshExpiresIn;
        case 'jwt.refresh.prefix':
          return refreshPrefix;
        default:
          return null;
      }
    }),
  };

  interface Payload {
    id: string;
    email: string;
  }

  const mockJwtService = {
    signAsync: jest.fn((payload: Payload, options: any): Promise<string> => {
      const token = `${payload.id}_${payload.email}_${options.secret}_${options.expiresIn}`;
      return Promise.resolve(token);
    }),
  };

  const mockRedisService = {
    setRefreshToken: jest.fn(),
    deleteRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
  };

  const accessSecret = 'jwt.access.secret';
  const accessExpiresIn = '3600';
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

  const mockTokens: Tokens = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
  };

  const mockSavedToken = {
    accessToken: `${mockUser.id}_${mockUser.email}_${accessSecret}_${accessExpiresIn}`,
    refreshToken: `${mockUser.id}_${mockUser.email}_${refreshSecret}_${refreshExpiresIn}`,
  };

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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('토큰을 생성해야 한다', async () => {
      mockRedisService.setRefreshToken.mockResolvedValueOnce(true);

      const result = await service.login(mockUser);

      expect(result).toEqual(mockSavedToken);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('토큰 생성에 실패하면 FailedToCreateTokensError를 반환한다', async () => {
      mockJwtService.signAsync.mockRejectedValueOnce(new Error());

      await expect(service.login(mockUser)).rejects.toThrow(
        FailedToCreateTokensError,
      );
    });

    it('토큰을 세션 스토리지에 저장해야 한다', async () => {
      mockRedisService.setRefreshToken.mockResolvedValueOnce(true);

      await service.login(mockUser);

      expect(mockRedisService.setRefreshToken).toHaveBeenCalledWith({
        id: `${refreshPrefix}1`,
        token: mockSavedToken.refreshToken,
        ttl: refreshExpiresIn,
      });
    });

    it('토큰을 저장하는 것에 실패하면 FailedToSetRefreshTokenError를 반환한다', async () => {
      mockRedisService.setRefreshToken.mockRejectedValueOnce(new Error());

      await expect(service.login(mockUser)).rejects.toThrow(
        FailedToSetRefreshTokenError,
      );
    });
  });

  describe('logout', () => {
    it('세션 저장소에서 토큰을 삭제해야 한다', async () => {
      mockRedisService.deleteRefreshToken.mockResolvedValueOnce(true);

      const result = await service.logout('1');

      expect(result).toBe(true);
      expect(mockRedisService.deleteRefreshToken).toHaveBeenCalledWith(
        `${refreshPrefix}1`,
      );
    });

    it('세션 저장소에서 토큰을 삭제하지 못하면 FailedToDeleteRefreshTokenError을 반환한다', async () => {
      mockRedisService.deleteRefreshToken.mockRejectedValueOnce(new Error());

      await expect(service.logout('1')).rejects.toThrow(
        FailedToDeleteRefreshTokenError,
      );
    });
  });

  describe('checkIsLoggedIn', () => {
    it('유저로 부터 받은 토큰이 세션 저장소에 있는 토큰과 동일하다면 true를 반환한다', async () => {
      mockRedisService.getRefreshToken.mockResolvedValueOnce(
        mockTokens.refreshToken,
      );

      const result = await service.checkIsLoggedIn(
        '1',
        mockTokens.refreshToken,
      );

      expect(result).toBe(true);
      expect(mockRedisService.getRefreshToken).toHaveBeenCalledWith(
        `${refreshPrefix}1`,
      );
    });

    it('세션 저장소에서 토큰을 가져오는 것에 실패하면 FailedToGetRefreshTokenError를 반환한다', async () => {
      mockRedisService.getRefreshToken.mockRejectedValueOnce(new Error());

      await expect(
        service.checkIsLoggedIn('1', mockTokens.refreshToken),
      ).rejects.toThrow(FailedToGetRefreshTokenError);
    });

    it('유저로 부터 받은 토큰과 세션 저장소에 있는 토큰이 일치하지 않으면 false를 반환한다', async () => {
      mockRedisService.getRefreshToken.mockResolvedValueOnce('invalid_token');

      const result = await service.checkIsLoggedIn(
        '1',
        mockTokens.refreshToken,
      );

      expect(result).toBe(false);
    });
  });
});
