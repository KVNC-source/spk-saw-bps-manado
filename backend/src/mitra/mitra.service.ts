import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MitraService {
  constructor(private prisma: PrismaService) {}

  // =====================
  // DASHBOARD SUMMARY
  // =====================
  async getDashboardSummary(mitraId: number) {
    const totalAlokasi = await this.prisma.alokasiMitra.count({
      where: { mitra_id: mitraId },
    });

    const alokasiDraft = await this.prisma.alokasiMitra.count({
      where: {
        mitra_id: mitraId,
        status: 'PENDING',
      },
    });

    const alokasiApproved = await this.prisma.alokasiMitra.count({
      where: {
        mitra_id: mitraId,
        status: 'APPROVED',
      },
    });

    const spkDocs = await this.prisma.spkDocument.findMany({
      where: { mitra_id: mitraId },
      select: { kegiatan_ids: true },
    });

    const usedKegiatanIds = spkDocs.flatMap((d) => d.kegiatan_ids);

    const alokasiUsed = usedKegiatanIds.length
      ? await this.prisma.alokasiMitra.count({
          where: {
            mitra_id: mitraId,
            kegiatan_id: { in: usedKegiatanIds },
          },
        })
      : 0;

    return {
      totalAlokasi,
      alokasiDraft,
      alokasiApproved,
      alokasiUsed,
    };
  }

  // =====================
  // ALOKASI SAYA (MITRA)
  // =====================
  async getMyAlokasi(mitraId: number) {
    return this.prisma.alokasiMitra.findMany({
      where: {
        mitra_id: mitraId,
      },
      select: {
        id: true,
        kegiatan: true,
        volume: true,
        tarif: true,
        jumlah: true,
        status: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  // =====================
  // DATA MITRA (ADMIN)
  // =====================
  async findAll() {
    return this.prisma.mitra.findMany({
      orderBy: {
        nama_mitra: 'asc',
      },
    });
  }
}
