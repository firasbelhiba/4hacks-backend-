import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { authCookiesNames, jwtConstants } from '../constants';
import { AuthService } from '../auth.service';
import { JwtPayload } from 'src/common/types';
import { Request } from 'express';

/**
 * Custom extractor that tries to get JWT from cookies first,
 * then falls back to Authorization header for backward compatibility
 */
const cookieOrHeaderExtractor = (req: Request): string | null => {
  // First, try to get token from httpOnly cookie
  if (req.cookies && req.cookies[authCookiesNames.accessToken]) {
    return req.cookies[authCookiesNames.accessToken];
  }

  // Fallback to Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: cookieOrHeaderExtractor,
      ignoreExpiration: false, // do not ignore expiration
      secretOrKey: jwtConstants.secret,
    });
  }

  /**
   * Validate the JWT payload and return the user object
   * @param payload - The decoded JWT payload
   * @returns The user object if valid, otherwise throws UnauthorizedException
   */
  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid access Token');
    }

    return user;
  }
}
