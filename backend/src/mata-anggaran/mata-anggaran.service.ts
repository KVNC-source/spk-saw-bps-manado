import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MataAnggaranService {
  constructor(private readonly prisma: PrismaService) {}

  /* ================= ADMIN ================= */

  async findAll() {
    return this.prisma.mataAnggaran.findMany({
      orderBy: [{ tahun: 'desc' }, { nama_anggaran: 'asc' }],
    });
  }

  async findById(id: number) {
    const data = await this.prisma.mataAnggaran.findUnique({
      where: { id },
    });

    if (!data) {
      throw new NotFoundException('Mata anggaran tidak ditemukan');
    }

    return data;
  }

  async create(data: {
    kode_anggaran: string;
    nama_anggaran: string;
    tahun: number;
    is_active: boolean;
  }) {
    return this.prisma.mataAnggaran.create({
      data,
    });
  }

  async update(
    id: number,
    data: {
      kode_anggaran?: string;
      nama_anggaran?: string;
      tahun?: number;
      is_active?: boolean;
    },
  ) {
    await this.findById(id);

    return this.prisma.mataAnggaran.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findById(id);

    const used = await this.prisma.kegiatan.count({
      where: { mata_anggaran_id: id },
    });

    if (used > 0) {
      throw new BadRequestException(
        'Mata anggaran sudah digunakan oleh kegiatan',
      );
    }

    return this.prisma.mataAnggaran.delete({
      where: { id },
    });
  }
}
