import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculateSawDto } from './dto/calculate-saw.dto';
import { SpkService } from '../spk.service';

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

/* ─────────────────────────────
 * SAW SERVICE
 * ───────────────────────────── */
@Injectable()
export class SawService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spkService: SpkService,
  ) {}

  async calculate(dto: CalculateSawDto) {
    const {
      tahun,
      bulan,
      spkRoleId,
      kegiatanIds,
      tanggalMulai,
      tanggalSelesai,
    } = dto;

    const mulai = new Date(tanggalMulai);
    const selesai = new Date(tanggalSelesai);

    if (selesai < mulai) {
      throw new BadRequestException(
        'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
      );
    }

    /* 1️⃣ Fetch ONLY requested kegiatan */
    const alokasi = await this.prisma.alokasiMitra.findMany({
      where: {
        tahun,
        bulan,
        status: 'APPROVED',
        kegiatan_id: { in: kegiatanIds },
      },
      include: {
        mitra: true,
        kegiatan: true,
      },
    });

    if (!alokasi.length) {
      throw new BadRequestException(
        'Tidak ada data alokasi mitra APPROVED untuk kegiatan yang dipilih',
      );
    }

    /* 2️⃣ Build SPK title */
    const kegiatanForTitle = Array.from(
      new Map(
        alokasi.map((a) => [
          a.kegiatan_id,
          {
            nama: a.kegiatan.nama_kegiatan,
            periode: getPeriodeLabel(a.kegiatan.nama_kegiatan, bulan, tahun),
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

    for (const a of alokasi) {
      if (!map.has(a.mitra_id)) {
        map.set(a.mitra_id, {
          mitraId: a.mitra_id,
          mitraNama: a.mitra.nama_mitra,
          totalVolume: 0,
          totalNilai: 0,
          kegiatanSet: new Set<number>(),
        });
      }

      const m = map.get(a.mitra_id)!;
      m.totalVolume += Number(a.volume);
      m.totalNilai += Number(a.jumlah);
      m.kegiatanSet.add(a.kegiatan_id);
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
        const detail: Record<
          CriterionKey,
          {
            nilaiAsli: number;
            normalized: number;
            bobot: number;
            kontribusi: number;
          }
        > = {} as any;

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

    /* 5️⃣ Generate SPK snapshot (scope locked via kegiatanIds) */
    for (const r of ranked) {
      await this.spkService.createSpk({
        tahun,
        bulan,
        mitraId: r.mitraId,
        spkKegiatan,
        spkRoleId,
        tanggalMulai: mulai,
        tanggalSelesai: selesai,
        kegiatanIds, // ✅ snapshot scope (LEGAL)
      });
    }

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
