import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../types/tokens.type';
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

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
