import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payload } from '../types/payload.type';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.headers['x-refresh-token']?.toString().trim() ?? '';
        },
      ]),
      secretOrKey: configService.get<string>('jwt.refresh.secret'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: Payload): any {
    console.log(req.headers['x-refresh-token']?.toString());
    const refreshToken = req.headers['x-refresh-token']?.toString();

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token malformed');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
