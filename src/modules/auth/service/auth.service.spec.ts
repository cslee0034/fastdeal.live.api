import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { RedisService } from '../../../infrastructure/cache/service/redis.service';
import { TokenService } from '../../../infrastructure/token/service/token.service';
import { UserEntity } from '../../users/entities/user.entity';
import { Tokens } from '../../../infrastructure/token/interface/tokens.interface';

describe('AuthService', () => {
  let service: AuthService;

  const refreshExpiresIn = 3600;
  const refreshPrefix = 'refresh_';

  const mockUser = new UserEntity({
    id: '1',
    email: 'test@email.com',
    provider: 'local',
    firstName: 'testFirstName',
    lastName: 'testLastName',
  });

  const mockTokens: Tokens = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
  };

  const mockTokenService = {
    generateTokens: jest.fn().mockResolvedValue(mockTokens),
    getRefreshTokenId: jest.fn().mockReturnValue(`${refreshPrefix}1`),
    getRefreshTokenExpiresIn: jest.fn().mockReturnValue(refreshExpiresIn),
  };

  const mockRedisService = {
    setRefreshToken: jest.fn(),
    deleteRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: TokenService, useValue: mockTokenService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('토큰을 생성하고 캐시에 저장해야 한다', async () => {
      mockRedisService.setRefreshToken.mockResolvedValue(true);

      const result = await service.login(mockUser);

      expect(mockTokenService.generateTokens).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
      );
      expect(mockRedisService.setRefreshToken).toHaveBeenCalledWith({
        id: `${refreshPrefix}1`,
        token: mockTokens.refreshToken,
        ttl: 3600,
      });
      expect(result).toEqual(mockTokens);
    });
  });

  describe('logout', () => {
    it('캐시에서 refreshToken을 삭제해야 한다', async () => {
      mockRedisService.deleteRefreshToken.mockResolvedValue(true);

      const result = await service.logout(mockUser.id);

      expect(mockRedisService.deleteRefreshToken).toHaveBeenCalledWith(
        `${refreshPrefix}1`,
      );
      expect(result).toBe(true);
    });
  });

  describe('checkIsLoggedIn', () => {
    it('refreshToken과 캐시에 저장된 토큰이 일치하면 true를 반환해야 한다', async () => {
      mockRedisService.getRefreshToken.mockResolvedValue(
        mockTokens.refreshToken,
      );

      const result = await service.checkIsLoggedIn(
        mockUser.id,
        mockTokens.refreshToken,
      );

      expect(mockRedisService.getRefreshToken).toHaveBeenCalledWith(
        `${refreshPrefix}1`,
      );
      expect(result).toBe(true);
    });

    it('refreshToken과 캐시의 토큰이 일치하지 않으면 false를 반환해야 한다', async () => {
      mockRedisService.getRefreshToken.mockResolvedValue('invalidToken');

      const result = await service.checkIsLoggedIn(
        mockUser.id,
        mockTokens.refreshToken,
      );

      expect(mockRedisService.getRefreshToken).toHaveBeenCalledWith(
        `${refreshPrefix}1`,
      );
      expect(result).toBe(false);
    });
  });
});
