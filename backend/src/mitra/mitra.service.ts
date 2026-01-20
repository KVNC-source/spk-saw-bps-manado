import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MitraService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.mitra.findMany({
      orderBy: { nama_mitra: 'asc' },
    });
  }

  async findOne(id: number) {
    const mitra = await this.prisma.mitra.findUnique({
      where: { id },
    });

    if (!mitra) {
      throw new NotFoundException('Mitra tidak ditemukan');
    }

    return mitra;
  }
}
