import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { googleOAuthConstants } from '../constants';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: googleOAuthConstants.clientID,
      clientSecret: googleOAuthConstants.clientSecret,
      callbackURL: googleOAuthConstants.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user = await this.authService.validateGoogleQauthUser(
      profile.emails[0].value,
      profile.displayName,
      profile.photos[0].value,
    );

    done(null, user);
  }
}
