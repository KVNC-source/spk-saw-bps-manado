import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(username: string, password: string) {
    console.log('LOGIN PARAMS:', username, password);

    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { username },
      });
      console.log('AFTER QUERY:', user);
    } catch (err) {
      console.error('🔥 PRISMA ERROR 🔥');
      console.error(err);
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log('PASSWORD CHECK:', valid);

    if (!valid) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      accessToken: this.jwtService.sign({
        id: user.id,
        username: user.username,
        role: user.role,
      }),
      user,
    };
  }
}
