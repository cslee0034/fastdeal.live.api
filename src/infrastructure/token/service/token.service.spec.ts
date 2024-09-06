import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FailedToCreateTokensError } from '../error/failed-to-create-tokens';
import { Payload } from '../interface/payload.interface';

describe('TokenService', () => {
  let tokenService: TokenService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockPayload: Payload = {
    id: 'testId',
    email: 'test@example.com',
  };

  const mockAccessToken = 'mockAccessToken';
  const mockRefreshToken = 'mockRefreshToken';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(tokenService).toBeDefined();
  });

  describe('generateTokens', () => {
    it('토큰을 생성해야 한다', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);

      const tokens = await tokenService.generateTokens(
        mockPayload.id,
        mockPayload.email,
      );

      expect(tokens).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('토큰 생성에 실패하면 FailedToCreateTokensError를 반환한다', async () => {
      mockJwtService.signAsync.mockRejectedValueOnce(new Error());

      await expect(
        tokenService.generateTokens(mockPayload.id, mockPayload.email),
      ).rejects.toThrow(FailedToCreateTokensError);
    });
  });

  describe('getRefreshTokenId', () => {
    it('refreshToken의 ID를 반환해야 한다', () => {
      mockConfigService.get.mockReturnValue('refresh_');

      const refreshTokenId = tokenService.getRefreshTokenId(mockPayload.id);

      expect(refreshTokenId).toBe(`refresh_${mockPayload.id}`);
    });
  });

  describe('getRefreshTokenExpiresIn', () => {
    it('refreshToken의 만료 기간을 반환해야 한다', () => {
      mockConfigService.get.mockReturnValue('3600');

      const refreshTokenExpiresIn = tokenService.getRefreshTokenExpiresIn();

      expect(refreshTokenExpiresIn).toBe(3600);
    });
  });

  describe('generateAccessToken', () => {
    it('액세스 토큰을 생성해야 한다', async () => {
      mockConfigService.get.mockReturnValueOnce('accessSecret');
      mockConfigService.get.mockReturnValueOnce(3600);
      mockJwtService.signAsync.mockResolvedValueOnce(mockAccessToken);

      const result = await tokenService['generateAccessToken'](mockPayload);

      expect(result).toBe(mockAccessToken);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(mockPayload, {
        secret: 'accessSecret',
        expiresIn: 3600,
      });
    });
  });

  describe('generateRefreshToken', () => {
    it('리프레시 토큰을 생성해야 한다', async () => {
      mockConfigService.get.mockReturnValueOnce('refreshSecret');
      mockConfigService.get.mockReturnValueOnce(7200);
      mockJwtService.signAsync.mockResolvedValueOnce(mockRefreshToken);

      const result = await tokenService['generateRefreshToken'](mockPayload);

      expect(result).toBe(mockRefreshToken);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(mockPayload, {
        secret: 'refreshSecret',
        expiresIn: 7200,
      });
    });
  });

  describe('getAccessTokenSecret', () => {
    it('액세스 토큰의 비밀 키를 반환해야 한다', () => {
      mockConfigService.get.mockReturnValue('accessSecret');

      const accessTokenSecret = tokenService['getAccessTokenSecret']();

      expect(accessTokenSecret).toBe('accessSecret');
    });
  });

  describe('getRefreshTokenSecret', () => {
    it('리프레시 토큰의 비밀 키를 반환해야 한다', () => {
      mockConfigService.get.mockReturnValue('refreshSecret');

      const refreshTokenSecret = tokenService['getRefreshTokenSecret']();

      expect(refreshTokenSecret).toBe('refreshSecret');
    });
  });

  describe('getAccessTokenExpiresIn', () => {
    it('액세스 토큰의 만료 기간을 반환해야 한다', () => {
      mockConfigService.get.mockReturnValue(3600);

      const accessTokenExpiresIn = tokenService['getAccessTokenExpiresIn']();

      expect(accessTokenExpiresIn).toBe(3600);
    });
  });
});
