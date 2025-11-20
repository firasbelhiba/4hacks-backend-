import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { githubOAuthConstants } from '../constants';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: githubOAuthConstants.clientID,
      clientSecret: githubOAuthConstants.clientSecret,
      callbackURL: githubOAuthConstants.callbackURL,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName || '';
      const image = profile.photos[0].value || '';

      const user = await this.authService.validateGithubOAuthUser(
        email,
        name,
        image,
      );

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
