import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Provider } from '../../users/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('google.clientId'),
      clientSecret: configService.get<string>('google.clientSecret'),
      callbackURL: `${configService.get<string>('app.protocol')}://${configService.get<string>('app.host')}:${configService.get<number>('app.port')}/auth/google/redirect`,
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      email: profile.emails[0].value,
      provider: Provider.GOOGLE,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
    };
  }
}
