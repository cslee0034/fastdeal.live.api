import { Injectable } from '@nestjs/common';
import { ITokenService } from '../interface/token.service.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FailedToCreateTokensError } from '../error/failed-to-create-tokens';
import { Tokens } from '../interface/tokens.interface';
import { Payload } from '../interface/payload.interface';

@Injectable()
export class TokenService implements ITokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async generateTokens(id: string, email: string): Promise<Tokens> {
    const payload: Payload = {
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

  public getRefreshTokenId(id: string): string {
    return `${this.configService.get<number>('jwt.refresh.prefix')}${id}`;
  }

  public getRefreshTokenExpiresIn(): number {
    return Number(this.configService.get<number>('jwt.refresh.expiresIn'));
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

  private getAccessTokenSecret(): string {
    return this.configService.get<string>('jwt.access.secret');
  }

  private getRefreshTokenSecret(): string {
    return this.configService.get<string>('jwt.refresh.secret');
  }

  private getAccessTokenExpiresIn(): number {
    return this.configService.get<number>('jwt.access.expiresIn');
  }
}
