/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SpkDocument } from '@prisma/client';

@Injectable()
export class SpkApprovalService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<SpkDocument[]> {
    return this.prisma.spkDocument.findMany({
      include: { mitra: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number): Promise<SpkDocument> {
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id },
      include: { mitra: true },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    return spk;
  }

  async approve(spkId: number, approvedBy: string): Promise<SpkDocument> {
    return this.prisma.$transaction(async (tx) => {
      const spk = await tx.spkDocument.findUnique({
        where: { id: spkId },
      });

      if (!spk) {
        throw new NotFoundException('SPK tidak ditemukan');
      }

      if (spk.status !== 'PENDING') {
        throw new BadRequestException(
          'SPK hanya dapat disetujui jika berstatus PENDING',
        );
      }

      // 🔍 Check existing alokasi
      const existingAlokasi = await tx.alokasiMitra.findMany({
        where: {
          mitra_id: spk.mitra_id,
          tahun: spk.tahun,
          kegiatan_id: { in: spk.kegiatan_ids },
        },
      });

      if (existingAlokasi.length === 0) {
        // 🔹 Fetch kegiatan data
        const kegiatanList = await tx.kegiatan.findMany({
          where: {
            id: { in: spk.kegiatan_ids },
            tahun: spk.tahun,
          },
        });

        if (kegiatanList.length === 0) {
          throw new BadRequestException(
            'Tidak dapat membuat alokasi: kegiatan tidak ditemukan',
          );
        }

        // 🔹 Create alokasi rows
        await tx.alokasiMitra.createMany({
          data: kegiatanList.map((k) => ({
            tahun: spk.tahun,
            bulan: spk.bulan,
            mitra_id: spk.mitra_id,
            kegiatan_id: k.id,
            volume: 1,
            tarif: k.tarif_per_satuan ?? 0,
            jumlah: (k.tarif_per_satuan ?? 0) * 1,
            status: 'APPROVED',
          })),
        });
      } else {
        // 🔹 If already exists, just approve them
        await tx.alokasiMitra.updateMany({
          where: {
            id: { in: existingAlokasi.map((a) => a.id) },
          },
          data: { status: 'APPROVED' },
        });
      }

      // ✅ Approve SPK
      return tx.spkDocument.update({
        where: { id: spkId },
        data: {
          status: 'APPROVED',
          approved_by: approvedBy,
          approved_at: new Date(),
        },
      });
    });
  }

  async reject(spkId: number, note: string): Promise<SpkDocument> {
    if (!note?.trim()) {
      throw new BadRequestException('Catatan penolakan wajib diisi');
    }

    const spk = await this.prisma.spkDocument.findUnique({
      where: { id: spkId },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    if (spk.status !== 'PENDING') {
      throw new BadRequestException(
        'SPK hanya dapat ditolak jika berstatus PENDING',
      );
    }

    return this.prisma.spkDocument.update({
      where: { id: spkId },
      data: {
        status: 'REJECTED',
        admin_note: note,
      },
    });
  }
}
