import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.type';
import { Role } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'bps-secret',
    });
  }

  validate(payload: any): JwtPayload {
    return {
      id: payload.sub,
      name: payload.name,
      role: payload.role as Role,
      mitra_id: payload.mitra_id,
    };
  }
}
