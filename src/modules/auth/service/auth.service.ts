import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../types/tokens.type';
import { RedisService } from '../../cache/service/redis.service';
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
      throw new InternalServerErrorException('Failed to set refresh token');
    }
  }

  async generateToken(id: number, email: string): Promise<Tokens> {
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
      throw new InternalServerErrorException('Failed to create token');
    }
  }
}
