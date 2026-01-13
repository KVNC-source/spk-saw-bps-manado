import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculateSawDto } from './dto/calculate-saw.dto';
import { SawResultDto } from './dto/saw-result.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SawService {
  constructor(private readonly prisma: PrismaService) {}

  async calculate(dto: CalculateSawDto): Promise<SawResultDto> {
    const { periodeId } = dto;

    // 1️⃣ Fetch periode (validation)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const periode = await this.prisma.periode.findUnique({
      where: { id: periodeId },
    });

    if (!periode) {
      throw new Error('Periode not found');
    }

    // 2️⃣ Fetch kriteria (explicitly typed)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const kriterias: Prisma.KriteriaGetPayload<{}>[] =
      await this.prisma.kriteria.findMany({
        where: { aktif: true },
        orderBy: { nama: 'asc' },
      });

    // 3️⃣ Fetch penilaian SPK (explicitly typed)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const penilaian: Prisma.PenilaianSPKGetPayload<{
      include: { mitra: true };
    }>[] = await this.prisma.penilaianSPK.findMany({
      where: { periodeId },
      include: {
        mitra: true,
      },
    });

    // 4️⃣ Build decision matrix
    const matrix: Record<
      string,
      {
        mitraId: string;
        mitraNama: string;
        nilai: Record<string, number>;
      }
    > = {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (const p of penilaian) {
      if (!matrix[p.mitraId]) {
        matrix[p.mitraId] = {
          mitraId: p.mitraId,
          mitraNama: p.mitra.nama,
          nilai: {},
        };
      }

      matrix[p.mitraId].nilai[p.kriteriaId] = p.nilai;
    }

    // 5️⃣ Find max & min per kriteria
    const kriteriaStats: Record<string, { max: number; min: number }> = {};

    for (const k of kriterias) {
      const values = Object.values(matrix).map((m) => m.nilai[k.id]);

      kriteriaStats[k.id] = {
        max: Math.max(...values),
        min: Math.min(...values),
      };
    }

    // 6️⃣ Calculate Vi (SAW preference value)
    const hasil = Object.values(matrix).map((m) => {
      let total = 0;

      for (const k of kriterias) {
        const nilai = m.nilai[k.id];
        const { max, min } = kriteriaStats[k.id];

        let normalized = 0;

        if (k.tipe === 'BENEFIT') {
          normalized = nilai / max;
        } else {
          normalized = min / nilai;
        }

        total += normalized * k.bobot;
      }

      return {
        mitraId: m.mitraId,
        mitraNama: m.mitraNama,
        nilaiPreferensi: Number(total.toFixed(4)),
        peringkat: 0,
      };
    });

    // 7️⃣ Ranking
    hasil.sort((a, b) => b.nilaiPreferensi - a.nilaiPreferensi);

    hasil.forEach((h, index) => {
      h.peringkat = index + 1;
    });

    // 8️⃣ Return result
    return {
      periodeId,
      metode: 'SAW',
      totalAlternatif: hasil.length,
      hasil,
    };
  }
}
