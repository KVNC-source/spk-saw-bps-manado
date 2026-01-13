import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Mitra } from '@prisma/client';

@Injectable()
export class MitraService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Mitra[]> {
    return this.prisma.mitra.findMany({
      include: {
        user: true,
      },
    });
  }

  async findById(id: string): Promise<Mitra | null> {
    return this.prisma.mitra.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }
}
