import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculateSawDto } from './dto/calculate-saw.dto';
import { SpkService } from '../spk.service';

/* ─────────────────────────────
 * SAW Criteria Definition
 * ───────────────────────────── */
type CriterionKey = 'totalVolume' | 'totalNilai' | 'jumlahKegiatan';

interface SawCriterion {
  key: CriterionKey;
  label: string;
  weight: number;
  type: 'BENEFIT' | 'COST';
}

const SAW_CRITERIA: SawCriterion[] = [
  {
    key: 'totalVolume',
    label: 'Total Volume Pekerjaan',
    weight: 0.3,
    type: 'BENEFIT',
  },
  {
    key: 'totalNilai',
    label: 'Total Nilai Honor',
    weight: 0.5,
    type: 'BENEFIT',
  },
  {
    key: 'jumlahKegiatan',
    label: 'Jumlah Kegiatan',
    weight: 0.2,
    type: 'BENEFIT',
  },
];

/* ─────────────────────────────
 * SPK TITLE FORMATTER
 * ───────────────────────────── */
type KegiatanTitleInput = {
  nama: string;
  periode: string;
};

function formatSpkKegiatan(kegiatanList: KegiatanTitleInput[]): string {
  if (!kegiatanList || kegiatanList.length === 0) {
    throw new Error('SPK kegiatan list cannot be empty');
  }

  const formatted = kegiatanList.map((k) =>
    `${k.nama} ${k.periode}`.trim().toUpperCase(),
  );

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} DAN ${formatted[1]}`;

  const last = formatted.pop();
  return `${formatted.join(', ')}, DAN ${last}`;
}

@Injectable()
export class SawService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spkService: SpkService,
  ) {}

  async calculate(dto: CalculateSawDto) {
    const { tahun, bulan } = dto;

    /* ─────────────────────────────
     * 0️⃣ Guard: prevent double execution
     * ───────────────────────────── */
    const existingSpk = await this.prisma.spkDocument.findFirst({
      where: { tahun, bulan },
    });

    if (existingSpk) {
      throw new BadRequestException(
        'SPK untuk periode ini sudah pernah dihasilkan',
      );
    }

    /* ─────────────────────────────
     * 1️⃣ Fetch APPROVED alokasi
     * ───────────────────────────── */
    const alokasi = await this.prisma.alokasiMitra.findMany({
      where: {
        tahun,
        bulan,
        status: 'APPROVED',
      },
      include: {
        mitra: true,
        kegiatan: true, // IMPORTANT: this relation EXISTS
      },
    });

    if (alokasi.length === 0) {
      throw new BadRequestException(
        'Tidak ada data alokasi mitra APPROVED untuk periode ini',
      );
    }

    /* ─────────────────────────────
     * 1️⃣b Build SPK kegiatan title (FIXED)
     * ───────────────────────────── */
    const kegiatanMap = new Map<number, string>();

    for (const row of alokasi) {
      if (!kegiatanMap.has(row.kegiatan_id)) {
        kegiatanMap.set(row.kegiatan_id, row.kegiatan.nama_kegiatan);
      }
    }

    const kegiatanForTitle: KegiatanTitleInput[] = Array.from(
      kegiatanMap.values(),
    ).map((nama) => ({
      nama,
      periode: `${bulan} ${tahun}`, // PERIODE SESUAI DOCX
    }));

    const spk_kegiatan = formatSpkKegiatan(kegiatanForTitle);

    /* ─────────────────────────────
     * 2️⃣ Aggregate per mitra
     * ───────────────────────────── */
    const aggregated = new Map<
      number,
      {
        mitraId: number;
        mitraNama: string;
        totalVolume: number;
        totalNilai: number;
        kegiatanSet: Set<number>;
      }
    >();

    for (const row of alokasi) {
      const mitraId = row.mitra_id;

      if (!aggregated.has(mitraId)) {
        aggregated.set(mitraId, {
          mitraId,
          mitraNama: row.mitra.nama_mitra,
          totalVolume: 0,
          totalNilai: 0,
          kegiatanSet: new Set<number>(),
        });
      }

      const data = aggregated.get(mitraId)!;
      data.totalVolume += Number(row.volume);
      data.totalNilai += Number(row.jumlah);
      data.kegiatanSet.add(row.kegiatan_id);
    }

    const alternatives = Array.from(aggregated.values()).map((m) => ({
      mitraId: m.mitraId,
      mitraNama: m.mitraNama,
      totalVolume: m.totalVolume,
      totalNilai: m.totalNilai,
      jumlahKegiatan: m.kegiatanSet.size,
    }));

    /* ─────────────────────────────
     * 3️⃣ Max value per criterion
     * ───────────────────────────── */
    const maxValues: Record<CriterionKey, number> = {
      totalVolume: Math.max(...alternatives.map((a) => a.totalVolume)),
      totalNilai: Math.max(...alternatives.map((a) => a.totalNilai)),
      jumlahKegiatan: Math.max(...alternatives.map((a) => a.jumlahKegiatan)),
    };

    /* ─────────────────────────────
     * 4️⃣ SAW Calculation
     * ───────────────────────────── */
    const results = alternatives.map((alt) => {
      let score = 0;
      const detail: Record<
        string,
        {
          nilaiAsli: number;
          normalized: number;
          bobot: number;
          kontribusi: number;
        }
      > = {};

      for (const c of SAW_CRITERIA) {
        const nilaiAsli = alt[c.key];
        const max = maxValues[c.key];
        const normalized = max === 0 ? 0 : nilaiAsli / max;
        const kontribusi = normalized * c.weight;

        score += kontribusi;

        detail[c.key] = {
          nilaiAsli,
          normalized: Number(normalized.toFixed(4)),
          bobot: c.weight,
          kontribusi: Number(kontribusi.toFixed(4)),
        };
      }

      return {
        mitraId: alt.mitraId,
        mitraNama: alt.mitraNama,
        nilaiPreferensi: Number(score.toFixed(4)),
        detail,
      };
    });

    /* ─────────────────────────────
     * 5️⃣ Ranking
     * ───────────────────────────── */
    results.sort((a, b) => b.nilaiPreferensi - a.nilaiPreferensi);
    results.forEach((r, index) => {
      (r as any).peringkat = index + 1;
    });

    /* ─────────────────────────────
     * 6️⃣ Generate SPK
     * ───────────────────────────── */
    for (const r of results) {
      await this.spkService.createSpk({
        tahun,
        bulan,
        mitraId: r.mitraId,
        spkKegiatan: spk_kegiatan,
        spkRoleId: dto.spkRoleId, // ← from admin selection
      });
    }

    /* ─────────────────────────────
     * 7️⃣ Final Response
     * ───────────────────────────── */
    return {
      tahun,
      bulan,
      metode: 'SAW' as const,
      totalAlternatif: results.length,
      spkKegiatan: spk_kegiatan,
      hasil: results.map((r) => ({
        mitraId: r.mitraId,
        mitraNama: r.mitraNama,
        nilaiPreferensi: r.nilaiPreferensi,
        peringkat: (r as any).peringkat,
        detail: r.detail,
      })),
    };
  }
}
