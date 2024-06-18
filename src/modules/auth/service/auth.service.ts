import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../interfaces/tokens.interface';
import { RedisService } from '../../cache/service/redis.service';
import { Response, CookieOptions } from 'express';
import { AUTH_ERROR } from '../error/constant/auth.error.constant';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/service/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
  ) {}

  public async login(user: UserEntity): Promise<Tokens> {
    const tokens = await this.generateTokens(user.id, user.email);

    await this.setRefreshTokenToRedis(user.id, tokens.refreshToken);

    return tokens;
  }

  public async logout(id: string): Promise<boolean> {
    try {
      await this.redisService.del(
        `${this.configService.get<number>('jwt.refresh.prefix')}${id}`,
      );

      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        AUTH_ERROR.FAILED_TO_DELETE_REFRESH_TOKEN,
      );
    }
  }

  public async checkIsLoggedIn(
    id: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      const savedRefreshToken = await this.redisService.get(
        `${this.configService.get<number>('jwt.refresh.prefix')}${id}`,
      );

      if (savedRefreshToken !== refreshToken) {
        throw new UnauthorizedException(AUTH_ERROR.REFRESH_TOKEN_DO_NOT_MATCH);
      }

      return;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException(
        AUTH_ERROR.FAILED_TO_GET_REFRESH_TOKEN,
      );
    }
  }

  public redirectUser(response: Response, user: UserEntity): Promise<void> {
    const redirectUrl = this.buildRedirectUrl(user);

    response.redirect(HttpStatus.FOUND, redirectUrl);

    return;
  }

  public redirectUserWithError(
    response: Response,
    error: { message: string },
  ): Promise<void> {
    const redirectUrl = this.buildRedirectUrlWithError(error);

    response.redirect(HttpStatus.FOUND, redirectUrl);

    return;
  }

  public async response({
    user,
    tokens,
    response,
    status,
  }: {
    user: UserEntity;
    tokens: Tokens;
    response: Response;
    status: number;
  }): Promise<Response> {
    await this.setTokensToResponse(response, tokens);

    return response
      .status(status)
      .json(this.usersService.convertUserResponse(user));
  }

  private async generateTokens(id: string, email: string): Promise<Tokens> {
    const payload = {
      id: id,
      email: email,
    };

    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('jwt.access.secret'),
          expiresIn: this.configService.get<string>('jwt.access.expiresIn'),
        }),
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('jwt.refresh.secret'),
          expiresIn: this.configService.get<string>('jwt.refresh.expiresIn'),
        }),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException(
        AUTH_ERROR.FAILED_TO_CREATE_TOKENS,
      );
    }
  }

  private async setRefreshTokenToRedis(
    id: string,
    refreshToken: string,
  ): Promise<boolean> {
    try {
      await this.redisService.set(
        `${this.configService.get<number>('jwt.refresh.prefix')}${id}`,
        refreshToken,
        this.configService.get<number>('jwt.refresh.expiresIn'),
      );

      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        AUTH_ERROR.FAILED_TO_SET_REFRESH_TOKEN,
      );
    }
  }

  private async setTokensToResponse(
    res: Response,
    tokens: Tokens,
  ): Promise<void> {
    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };

    try {
      res.cookie('x-access-token', tokens.accessToken, {
        ...options,
        maxAge: Number(this.configService.get<number>('jwt.access.expiresIn')),
      });
      res.cookie('x-refresh-token', tokens.refreshToken, {
        ...options,
        maxAge: Number(this.configService.get<number>('jwt.refresh.expiresIn')),
      });

      return;
    } catch (error) {
      throw new InternalServerErrorException(
        AUTH_ERROR.FAILED_TO_SET_TOKENS_TO_COOKIE,
      );
    }
  }

  private buildRedirectUrl(user: UserEntity): string {
    return `${this.configService.get<string>('client.url')}/api/auth/google?id=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email)}&&provider=${encodeURIComponent(user.provider)}&firstName=${encodeURIComponent(user.firstName)}&lastName=${encodeURIComponent(user.lastName)}&expiresIn=${this.configService.get<number>('jwt.refresh.expiresIn')}`;
  }

  private buildRedirectUrlWithError(error: { message: string }): string {
    return `${this.configService.get<string>('client.url')}/api/auth/google?error=${encodeURIComponent(error?.message)}`;
  }
}
