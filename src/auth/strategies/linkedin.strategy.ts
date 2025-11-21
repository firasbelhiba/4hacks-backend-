import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { linkedinOAuthConstants } from '../constants';
import { AuthService } from '../auth.service';

@Injectable()
export class LinkedinStrategy extends PassportStrategy(OAuth2Strategy, 'linkedin') {
  constructor(private readonly authService: AuthService) {
    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: linkedinOAuthConstants.clientID,
      clientSecret: linkedinOAuthConstants.clientSecret,
      callbackURL: linkedinOAuthConstants.callbackURL,
      scope: ['openid', 'profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    try {
      // Fetch user info from LinkedIn's OpenID Connect userinfo endpoint
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch LinkedIn user info: ${response.statusText}`);
      }

      const userInfo = await response.json();

      const email = userInfo.email;
      const name = userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim();
      const image = userInfo.picture || '';

      const user = await this.authService.validateLinkedinOAuthUser(
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
