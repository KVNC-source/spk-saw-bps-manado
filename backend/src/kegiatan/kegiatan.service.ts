import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KegiatanService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.kegiatan.findMany({
      select: {
        id: true,
        nama_kegiatan: true,
        satuan: true,
        tarif_per_satuan: true,
      },
      orderBy: { id: 'asc' },
    });
  }
}
