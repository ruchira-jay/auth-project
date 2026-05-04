import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'jwt_secret_key',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) throw new UnauthorizedException();
    return { id: user._id, email: user.email, role: user.role, name: user.name };
  }
}
