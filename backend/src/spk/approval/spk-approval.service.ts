import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SpkDocument } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * SPK APPROVAL SERVICE
 * ===============================
 * Responsibilities:
 * - Approve SPK (FINAL)
 * - Generate alokasi_mitra
 * - Snapshot spk_document_item
 * - Atomic & immutable
 * - TA safe
 */
@Injectable()
export class SpkApprovalService {
  constructor(private readonly prisma: PrismaService) {}

  /* =====================================================
   * UTILITIES
   * ===================================================== */
  private async generateApprovedSpkNumber(
    tx: Prisma.TransactionClient,
    tahun: number,
  ) {
    const last = await tx.alokasiMitra.aggregate({
      _max: { nomor_urut: true },
      where: { tahun },
    });

    const nextNomor = (last._max?.nomor_urut ?? 0) + 1;
    const nomorSpk = `${nextNomor}/71710/${tahun}`;

    return {
      nomor_urut: nextNomor,
      nomor_spk: nomorSpk,
    };
  }

  /* =====================================================
   * LIST SPK (ADMIN)
   * ===================================================== */
  findAll(): Promise<SpkDocument[]> {
    return this.prisma.spkDocument.findMany({
      include: { mitra: true },
      orderBy: { created_at: 'desc' },
    });
  }

  /* =====================================================
   * DETAIL SPK
   * ===================================================== */
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

  /* =====================================================
   * APPROVE SPK (FINAL + SNAPSHOT)
   * ===================================================== */
  async approve(spkId: number, approvedBy: string): Promise<SpkDocument> {
    return this.prisma.$transaction(async (tx) => {
      const spk = await tx.spkDocument.findUnique({
        where: { id: spkId },
      });

      if (!spk) {
        throw new NotFoundException('SPK tidak ditemukan');
      }

      if (spk.status !== 'PENDING') {
        throw new BadRequestException('SPK tidak dapat di-approve');
      }

      /* ===============================
       * 1️⃣ LOAD ITEMS
       * =============================== */
      const items = await tx.spkDocumentItem.findMany({
        where: { spk_document_id: spk.id },
      });

      if (items.length === 0) {
        throw new BadRequestException(
          'SPK tidak memiliki kegiatan. Pilih kegiatan terlebih dahulu.',
        );
      }

      /* ===============================
       * 2️⃣ CALCULATE TOTAL
       * =============================== */
      const totalNilai = items.reduce(
        (sum, item) => sum + Number(item.nilai),
        0,
      );

      /* ===============================
       * 🔢 GENERATE OFFICIAL SPK NUMBER
       * =============================== */
      const { nomor_urut, nomor_spk } = await this.generateApprovedSpkNumber(
        tx,
        spk.tahun,
      );

      /* ===============================
       * 3️⃣ CREATE ALOKASI
       * =============================== */
      const alokasi = await tx.alokasiMitra.create({
        data: {
          spk_document_id: spk.id,
          mitra_id: spk.mitra_id,
          tahun: spk.tahun,
          bulan: spk.bulan,
          total_nilai: totalNilai,
          status: 'APPROVED',

          nomor_urut,
          nomor_spk,
        },
      });

      /* ===============================
       * 4️⃣ SNAPSHOT DETAIL
       * =============================== */
      await tx.alokasiMitraDetail.createMany({
        data: items.map((item) => ({
          alokasi_mitra_id: alokasi.id,
          spk_document_id: spk.id,
          mitra_id: spk.mitra_id,
          kegiatan_id: item.kegiatan_id,
          mata_anggaran_id: item.mata_anggaran_id,
          nilai: item.nilai,
        })),
      });

      /* ===============================
       * 5️⃣ FINALIZE SPK
       * =============================== */
      return tx.spkDocument.update({
        where: { id: spk.id },
        data: {
          status: 'APPROVED',

          // 🔥 FINALIZE SPK NUMBER HERE
          nomor_spk, // <-- THIS IS THE MISSING PIECE

          approved_at: new Date(),
          approved_by: approvedBy,
        },
      });
    });
  }

  /* =====================================================
   * REJECT SPK
   * ===================================================== */
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
