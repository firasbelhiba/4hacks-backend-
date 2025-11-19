import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // do not ignore expiration
      secretOrKey: jwtConstants.secret,
    });
  }

  /**
   * Validate the JWT payload and return the user object
   * @param payload - The decoded JWT payload
   * @returns The user object if valid, otherwise throws UnauthorizedException
   */
  async validate(payload: any) {
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid access Token');
    }

    return user;
  }
}
