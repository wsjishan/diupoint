import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

export type GoogleAuthUser = {
  email: string;
  fullName: string;
  returnTo: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID')?.trim();
    const clientSecret = configService
      .get<string>('GOOGLE_CLIENT_SECRET')
      ?.trim();
    const callbackURL = configService
      .get<string>('GOOGLE_CALLBACK_URL')
      ?.trim();

    super({
      clientID:
        clientID && clientID.length > 0 ? clientID : 'missing-client-id',
      clientSecret:
        clientSecret && clientSecret.length > 0
          ? clientSecret
          : 'missing-client-secret',
      callbackURL:
        callbackURL && callbackURL.length > 0
          ? callbackURL
          : 'http://localhost:4000/api/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  validate(
    req: { query?: { state?: string } },
    _accessToken: string,
    _refreshToken: string,
    profile: Profile
  ): GoogleAuthUser {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();

    if (!email) {
      throw new UnauthorizedException('Google account email is unavailable.');
    }

    const fullName =
      profile.displayName?.trim() ||
      [profile.name?.givenName, profile.name?.familyName]
        .filter((part): part is string =>
          Boolean(part && part.trim().length > 0)
        )
        .join(' ')
        .trim() ||
      'Google User';

    const state =
      typeof req.query?.state === 'string' && req.query.state.startsWith('/')
        ? req.query.state
        : '/';

    return {
      email,
      fullName,
      returnTo: state,
    };
  }
}
