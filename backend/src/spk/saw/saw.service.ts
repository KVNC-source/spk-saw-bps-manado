import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculateSawDto } from './dto/calculate-saw.dto';

/* ─────────────────────────────
 * PERIODE LABEL RULE
 * ───────────────────────────── */
function getPeriodeLabel(
  namaKegiatan: string,
  bulan: number,
  tahun: number,
): string {
  const bulanMap = [
    'JANUARI',
    'FEBRUARI',
    'MARET',
    'APRIL',
    'MEI',
    'JUNI',
    'JULI',
    'AGUSTUS',
    'SEPTEMBER',
    'OKTOBER',
    'NOVEMBER',
    'DESEMBER',
  ];

  if (namaKegiatan.toUpperCase().includes('SERUTI')) {
    return `TRIWULAN ${Math.ceil(bulan / 3)}`;
  }

  return `${bulanMap[bulan - 1]} ${tahun}`;
}

/* ─────────────────────────────
 * SAW CRITERIA TYPES
 * ───────────────────────────── */
type CriterionKey = 'totalVolume' | 'totalNilai' | 'jumlahKegiatan';

/* ─────────────────────────────
 * SAW CRITERIA CONFIG
 * ───────────────────────────── */
const SAW_CRITERIA: readonly { key: CriterionKey; weight: number }[] = [
  { key: 'totalVolume', weight: 0.3 },
  { key: 'totalNilai', weight: 0.5 },
  { key: 'jumlahKegiatan', weight: 0.2 },
] as const;

@Injectable()
export class SawService {
  constructor(private readonly prisma: PrismaService) {}

  async calculate(dto: CalculateSawDto) {
    const { tahun, bulan, kegiatanIds, tanggalMulai, tanggalSelesai } = dto;

    const mulai = new Date(tanggalMulai);
    const selesai = new Date(tanggalSelesai);

    if (selesai < mulai) {
      throw new BadRequestException(
        'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
      );
    }

    /* 1️⃣ Fetch SPK ITEMS (SOURCE OF TRUTH FOR SAW) */
    const items = await this.prisma.spkDocumentItem.findMany({
      where: {
        kegiatan_id: { in: kegiatanIds },
        spkDocument: {
          tahun,
          bulan,
          status: 'APPROVED',
        },
      },
      include: {
        kegiatan: true,
        spkDocument: {
          include: {
            mitra: true,
          },
        },
      },
    });

    if (!items.length) {
      throw new BadRequestException(
        'Tidak ada data SPK APPROVED untuk kegiatan yang dipilih',
      );
    }

    /* 2️⃣ Build SPK title */
    const kegiatanForTitle = Array.from(
      new Map(
        items.map((i) => [
          i.kegiatan_id,
          {
            nama: i.kegiatan.nama_kegiatan,
            periode: getPeriodeLabel(i.kegiatan.nama_kegiatan, bulan, tahun),
          },
        ]),
      ).values(),
    );

    const spkKegiatan = kegiatanForTitle
      .map((k) => `${k.nama} ${k.periode}`.toUpperCase())
      .join(' DAN ');

    /* 3️⃣ Aggregate per mitra */
    const map = new Map<
      number,
      {
        mitraId: number;
        mitraNama: string;
        totalVolume: number;
        totalNilai: number;
        kegiatanSet: Set<number>;
      }
    >();

    for (const item of items) {
      const mitraId = item.spkDocument.mitra_id;

      if (!map.has(mitraId)) {
        map.set(mitraId, {
          mitraId,
          mitraNama: item.spkDocument.mitra.nama_mitra,
          totalVolume: 0,
          totalNilai: 0,
          kegiatanSet: new Set<number>(),
        });
      }

      const m = map.get(mitraId)!;
      m.totalVolume += Number(item.volume);
      m.totalNilai += Number(item.nilai);
      m.kegiatanSet.add(item.kegiatan_id);
    }

    const alternatives = Array.from(map.values()).map((m) => ({
      mitraId: m.mitraId,
      mitraNama: m.mitraNama,
      totalVolume: m.totalVolume,
      totalNilai: m.totalNilai,
      jumlahKegiatan: m.kegiatanSet.size,
    }));

    /* 4️⃣ SAW normalization & ranking */
    const max: Record<CriterionKey, number> = {
      totalVolume: Math.max(...alternatives.map((a) => a.totalVolume)),
      totalNilai: Math.max(...alternatives.map((a) => a.totalNilai)),
      jumlahKegiatan: Math.max(...alternatives.map((a) => a.jumlahKegiatan)),
    };

    const ranked = alternatives
      .map((alt) => {
        let score = 0;
        const detail: any = {};

        for (const c of SAW_CRITERIA) {
          const normalized = max[c.key] ? alt[c.key] / max[c.key] : 0;
          const kontribusi = normalized * c.weight;

          score += kontribusi;

          detail[c.key] = {
            nilaiAsli: alt[c.key],
            normalized: Number(normalized.toFixed(4)),
            bobot: c.weight,
            kontribusi: Number(kontribusi.toFixed(4)),
          };
        }

        return {
          ...alt,
          nilaiPreferensi: Number(score.toFixed(4)),
          detail,
        };
      })
      .sort((a, b) => b.nilaiPreferensi - a.nilaiPreferensi)
      .map((r, i) => ({ ...r, peringkat: i + 1 }));

    return {
      tahun,
      bulan,
      metode: 'SAW' as const,
      kegiatanDigunakan: kegiatanForTitle.map((k) => k.nama),
      totalAlternatif: ranked.length,
      spkKegiatan,
      hasil: ranked,
    };
  }
}
