import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KegiatanService {
  constructor(private readonly prisma: PrismaService) {}

  /* =====================
   * PUBLIC / MITRA
   * ===================== */
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

  /* =====================
   * ADMIN
   * ===================== */

  async findAllAdmin() {
    return this.prisma.kegiatan.findMany({
      include: {
        mataAnggaran: true,
      },
      orderBy: { nama_kegiatan: 'asc' },
    });
  }

  async findById(id: number) {
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id },
    });

    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    return kegiatan;
  }

  async create(data: {
    nama_kegiatan: string;
    jenis_kegiatan: string;
    tahun: number;
    satuan?: string;
    tarif_per_satuan: number;
    mata_anggaran_id: number;
  }) {
    return this.prisma.kegiatan.create({
      data: {
        nama_kegiatan: data.nama_kegiatan,
        jenis_kegiatan: data.jenis_kegiatan,
        tahun: data.tahun,
        satuan: data.satuan,
        tarif_per_satuan: data.tarif_per_satuan,
        mata_anggaran_id: data.mata_anggaran_id,
      },
    });
  }

  async update(
    id: number,
    data: {
      nama_kegiatan?: string;
      satuan?: string;
      tarif_per_satuan?: number;
      mata_anggaran_id?: number;
    },
  ) {
    await this.findById(id);

    return this.prisma.kegiatan.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findById(id);

    // 🔒 SAFETY RULE
    const used = await this.prisma.spkDocumentItem.count({
      where: { kegiatan_id: id },
    });

    if (used > 0) {
      throw new BadRequestException(
        'Kegiatan sudah digunakan dalam SPK dan tidak dapat dihapus',
      );
    }

    return this.prisma.kegiatan.delete({
      where: { id },
    });
  }
}
