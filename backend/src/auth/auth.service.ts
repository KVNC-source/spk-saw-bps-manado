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
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    // 🔒 Do not reveal which part failed
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: this.jwtService.sign(
        {
          sub: user.id,
          name: user.name,
          role: user.role,
          mitra_id: user.mitra_id,
        },
        {
          expiresIn: '30m',
        },
      ),
      user: {
        id: user.id,
        username: user.username,
        name: user.name, // 🔥 ADD THIS
        role: user.role,
        mitra_id: user.mitra_id, // optional but recommended
      },
    };
  }
}
