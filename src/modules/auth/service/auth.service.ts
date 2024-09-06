import { Injectable } from '@nestjs/common';
import { Tokens } from '../../../infrastructure/token/interface/tokens.interface';
import { RedisService } from '../../../infrastructure/cache/service/redis.service';
import { UserEntity } from '../../users/entities/user.entity';
import { TokenService } from '../../../infrastructure/token/service/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly cacheService: RedisService,
  ) {}

  public async login(user: UserEntity): Promise<Tokens> {
    const tokens = await this.tokenService.generateTokens(user.id, user.email);
    const tokenId = this.tokenService.getRefreshTokenId(user.id);
    const expiresIn = this.tokenService.getRefreshTokenExpiresIn();

    await this.cacheService.setRefreshToken({
      id: tokenId,
      token: tokens.refreshToken,
      ttl: expiresIn,
    });

    return tokens;
  }

  public async logout(id: string): Promise<boolean> {
    const tokenId = this.tokenService.getRefreshTokenId(id);

    await this.cacheService.deleteRefreshToken(tokenId);

    return true;
  }

  public async checkIsLoggedIn(
    id: string,
    refreshToken: string,
  ): Promise<boolean> {
    const tokenId = this.tokenService.getRefreshTokenId(id);

    const savedRefreshToken = await this.cacheService.getRefreshToken(tokenId);

    return refreshToken && savedRefreshToken === refreshToken;
  }
}
