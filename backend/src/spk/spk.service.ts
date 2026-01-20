import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpkService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate Nomor SPK (BPS-style)
   * Example: SPK-110/71710/2026
   */
  private generateNomorSpk(tahun: number): string {
    const KODE_UNIT = '110/71710';
    return `SPK-${KODE_UNIT}/${tahun}`;
  }

  /**
   * Create SPK metadata for ONE mitra & periode
   */
  async createSpk(params: {
    tahun: number;
    bulan: number;
    mitraId: number;
    sawResultId?: number;
  }) {
    const { tahun, bulan, mitraId, sawResultId } = params;

    /* ─────────────────────────────
     * 1️⃣ Prevent duplicate SPK
     * ───────────────────────────── */
    const existing = await this.prisma.spkDocument.findFirst({
      where: {
        tahun,
        bulan,
        mitra_id: mitraId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'SPK untuk mitra dan periode ini sudah ada',
      );
    }

    /* ─────────────────────────────
     * 2️⃣ Aggregate honorarium (APPROVED only)
     * ───────────────────────────── */
    const aggregate = await this.prisma.alokasiMitra.aggregate({
      where: {
        tahun,
        bulan,
        mitra_id: mitraId,
        status: 'APPROVED',
      },
      _sum: {
        jumlah: true,
      },
    });

    const totalHonorariumDecimal = aggregate._sum.jumlah;

    if (totalHonorariumDecimal === null) {
      throw new BadRequestException(
        'Tidak ada alokasi APPROVED untuk mitra ini',
      );
    }

    const totalHonorarium = Number(totalHonorariumDecimal);

    if (totalHonorarium <= 0) {
      throw new BadRequestException('Total honorarium tidak valid');
    }

    /* ─────────────────────────────
     * 3️⃣ Generate nomor SPK
     * ───────────────────────────── */
    const nomorSpk = this.generateNomorSpk(tahun);

    /* ─────────────────────────────
     * 4️⃣ Persist SPK metadata
     * ───────────────────────────── */
    return this.prisma.spkDocument.create({
      data: {
        tahun,
        bulan,
        mitra_id: mitraId,
        total_honorarium: totalHonorariumDecimal, // Decimal → DB
        nomor_spk: nomorSpk,

        // optional relation to SAW
        ...(sawResultId !== undefined && {
          saw_result_id: sawResultId,
        }),
      },
    });
  }
}
