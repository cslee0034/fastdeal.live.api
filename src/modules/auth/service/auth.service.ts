import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../types/tokens.type';
import { RedisService } from '../../cache/service/redis.service';
import { Response, CookieOptions } from 'express';
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async login(id: number, refreshToken: string): Promise<boolean> {
    try {
      await this.redisService.set(
        `${this.configService.get<number>('jwt.refresh.prefix')}${id}`,
        refreshToken,
        this.configService.get<number>('jwt.refresh.expiresIn'),
      );
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to set refresh token to redis',
      );
    }
  }

  async logout(id: number): Promise<boolean> {
    try {
      await this.redisService.del(
        `${this.configService.get<number>('jwt.refresh.prefix')}${id}`,
      );
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete refresh token from redis',
      );
    }
  }

  async generateTokens(id: number, email: string): Promise<Tokens> {
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
      throw new InternalServerErrorException('Failed to create tokens');
    }
  }

  async setTokens(res: Response, tokens: Tokens) {
    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };

    try {
      res.cookie('x-access-token', tokens.accessToken, {
        ...options,
        maxAge: this.configService.get<number>('jwt.access.expiresIn'),
      });
      res.cookie('x-refresh-token', tokens.refreshToken, {
        ...options,
        maxAge: this.configService.get<number>('jwt.refresh.expiresIn'),
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to set tokens to cookie');
    }

    return;
  }

  async checkIsLoggedIn(id: number, refreshToken: string) {
    try {
      const savedRefreshToken = await this.redisService.get(
        `${this.configService.get<number>('jwt.refresh.prefix')}${id}`,
      );

      if (savedRefreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token do not match');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to get refresh token from redis',
      );
    }
    return;
  }
}
