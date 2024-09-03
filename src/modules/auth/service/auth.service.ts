import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../interface/tokens.interface';
import { RedisService } from '../../../infrastructure/cache/service/redis.service';
import { UserEntity } from '../../users/entities/user.entity';
import { FailedToDeleteRefreshTokenError } from '../error/failed-to-delete-refresh-token';
import { FailedToGetRefreshTokenError } from '../error/failed-to-get-refresh-token';
import { FailedToSetRefreshTokenError } from '../error/failed-to-set-refresh-token';
import { FailedToCreateTokensError } from '../error/failed-to-create-tokens';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly cacheService: RedisService,
  ) {}

  public async login(user: UserEntity): Promise<Tokens> {
    const tokens = await this.generateTokens(user.id, user.email);

    await this.setRefreshTokenToCache(user.id, tokens.refreshToken);

    return tokens;
  }

  public async logout(id: string): Promise<boolean> {
    const tokenId = this.getRefreshTokenId(id);

    await this.cacheService.deleteRefreshToken(tokenId).catch(() => {
      throw new FailedToDeleteRefreshTokenError();
    });

    return true;
  }

  public async checkIsLoggedIn(
    id: string,
    refreshToken: string,
  ): Promise<boolean> {
    const tokenId = this.getRefreshTokenId(id);

    const savedRefreshToken = await this.cacheService
      .getRefreshToken(tokenId)
      .catch(() => {
        throw new FailedToGetRefreshTokenError();
      });

    return refreshToken && savedRefreshToken === refreshToken;
  }

  private async generateTokens(id: string, email: string): Promise<Tokens> {
    const payload = {
      id: id,
      email: email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]).catch(() => {
      throw new FailedToCreateTokensError();
    });

    return { accessToken, refreshToken };
  }

  private async setRefreshTokenToCache(
    id: string,
    refreshToken: string,
  ): Promise<boolean> {
    const tokenId = this.getRefreshTokenId(id);
    const expiresIn = this.getRefreshTokenExpiresIn();

    await this.cacheService
      .setRefreshToken({
        id: tokenId,
        token: refreshToken,
        ttl: expiresIn,
      })
      .catch(() => {
        throw new FailedToSetRefreshTokenError();
      });

    return true;
  }

  private async generateAccessToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.getAccessTokenSecret(),
      expiresIn: this.getAccessTokenExpiresIn(),
    });
  }

  private async generateRefreshToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.getRefreshTokenSecret(),
      expiresIn: this.getRefreshTokenExpiresIn(),
    });
  }

  private getRefreshTokenId(id: string): string {
    return `${this.configService.get<number>('jwt.refresh.prefix')}${id}`;
  }

  private getAccessTokenSecret(): string {
    return this.configService.get<string>('jwt.access.secret');
  }

  private getRefreshTokenSecret(): string {
    return this.configService.get<string>('jwt.refresh.secret');
  }

  private getAccessTokenExpiresIn(): number {
    return this.configService.get<number>('jwt.access.expiresIn');
  }

  private getRefreshTokenExpiresIn(): number {
    return this.configService.get<number>('jwt.refresh.expiresIn');
  }
}
