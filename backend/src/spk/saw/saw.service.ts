import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculateSawDto } from './dto/calculate-saw.dto';
import { PenilaianMitra } from '@prisma/client';

/* =========================================================
   TYPES
========================================================= */

interface PerformanceResultItem {
  mitraId: number;
  mitraNama: string;
  ketepatan_waktu: number;
  kualitas: number;
  komunikasi: number;
  nilaiPreferensi: number;
  peringkat: number;
  kategori: string;
}

interface NormalizedMatrixItem {
  mitraNama: string;
  n_ketepatan_waktu: number;
  n_kualitas: number;
  n_komunikasi: number;
}

interface SavePenilaianDto {
  spkDocumentId: number;
  ketepatan_waktu: number;
  kualitas: number;
  komunikasi: number;
}

/* =========================================================
   CATEGORY CLASSIFICATION
========================================================= */

function getKategori(score: number): string {
  if (score >= 0.85) return 'Excellent';
  if (score >= 0.7) return 'Good';
  if (score >= 0.5) return 'Fair';
  return 'Poor';
}

/* =========================================================
   CONFIGURATION
========================================================= */

type CriterionKey = 'totalVolume' | 'totalNilai' | 'jumlahKegiatan';

const PERFORMANCE_WEIGHTS = {
  ketepatan_waktu: 0.3,
  kualitas: 0.4,
  komunikasi: 0.3,
};

const SAW_CRITERIA: readonly { key: CriterionKey; weight: number }[] = [
  { key: 'totalVolume', weight: 0.3 },
  { key: 'totalNilai', weight: 0.5 },
  { key: 'jumlahKegiatan', weight: 0.2 },
] as const;

/* =========================================================
   SERVICE
========================================================= */

@Injectable()
export class SawService {
  constructor(private readonly prisma: PrismaService) {}

  /* =========================================================
     OPERATIONAL SAW
  ========================================================= */

  async calculate(dto: CalculateSawDto) {
    const { tahun, bulan, kegiatanIds, tanggalMulai, tanggalSelesai } = dto;

    const mulai = new Date(tanggalMulai);
    const selesai = new Date(tanggalSelesai);

    if (selesai < mulai) {
      throw new BadRequestException(
        'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
      );
    }

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
        spkDocument: { include: { mitra: true } },
      },
    });

    if (!items.length) {
      throw new BadRequestException(
        'Tidak ada data SPK APPROVED untuk kegiatan yang dipilih',
      );
    }

    /* ================= AGGREGATE PER MITRA ================= */

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

    /* ================= NORMALIZATION ================= */

    const maxVolume = Math.max(...alternatives.map((a) => a.totalVolume));
    const maxNilai = Math.max(...alternatives.map((a) => a.totalNilai));
    const maxKegiatan = Math.max(...alternatives.map((a) => a.jumlahKegiatan));

    if (!maxVolume || !maxNilai || !maxKegiatan) {
      throw new BadRequestException(
        'Nilai maksimum tidak valid untuk normalisasi',
      );
    }

    const ranked = alternatives
      .map((alt) => {
        let score = 0;

        for (const c of SAW_CRITERIA) {
          const max =
            c.key === 'totalVolume'
              ? maxVolume
              : c.key === 'totalNilai'
                ? maxNilai
                : maxKegiatan;

          const normalized = alt[c.key] / max;
          score += normalized * c.weight;
        }

        const rounded = Number(score.toFixed(4));

        return {
          ...alt,
          nilaiPreferensi: rounded,
        };
      })
      .sort((a, b) => b.nilaiPreferensi - a.nilaiPreferensi)
      .map((r, i) => ({
        ...r,
        peringkat: i + 1,
      }));

    return {
      tahun,
      bulan,
      metode: 'SAW',
      totalAlternatif: ranked.length,
      hasil: ranked,
    };
  }

  /* =========================================================
     PERFORMANCE SAW
  ========================================================= */

  async calculatePerformanceSaw(tahun: number, bulan: number) {
    const spks = await this.prisma.spkDocument.findMany({
      where: { tahun, bulan, status: 'APPROVED' },
      include: { mitra: true, penilaianMitra: true },
    });

    if (!spks.length) {
      throw new BadRequestException('Tidak ada SPK APPROVED pada periode ini');
    }

    /* ================= AGGREGATE PER MITRA ================= */

    const map = new Map<
      number,
      {
        mitraId: number;
        mitraNama: string;
        ketepatan_waktu: number;
        kualitas: number;
        komunikasi: number;
        count: number;
      }
    >();

    for (const spk of spks) {
      if (!spk.penilaianMitra.length) {
        throw new BadRequestException(
          `SPK untuk mitra ${spk.mitra.nama_mitra} belum memiliki penilaian`,
        );
      }

      const p = spk.penilaianMitra[0];
      const mitraId = spk.mitra.id;

      if (!map.has(mitraId)) {
        map.set(mitraId, {
          mitraId,
          mitraNama: spk.mitra.nama_mitra,
          ketepatan_waktu: 0,
          kualitas: 0,
          komunikasi: 0,
          count: 0,
        });
      }

      const m = map.get(mitraId)!;
      m.ketepatan_waktu += Number(p.ketepatan_waktu);
      m.kualitas += Number(p.kualitas);
      m.komunikasi += Number(p.komunikasi);
      m.count += 1;
    }

    const alternatives = Array.from(map.values()).map((m) => ({
      mitraId: m.mitraId,
      mitraNama: m.mitraNama,
      ketepatan_waktu: m.ketepatan_waktu / m.count,
      kualitas: m.kualitas / m.count,
      komunikasi: m.komunikasi / m.count,
    }));

    /* ================= NORMALIZATION ================= */

    const maxWaktu = Math.max(...alternatives.map((a) => a.ketepatan_waktu));
    const maxKualitas = Math.max(...alternatives.map((a) => a.kualitas));
    const maxKomunikasi = Math.max(...alternatives.map((a) => a.komunikasi));

    if (!maxWaktu || !maxKualitas || !maxKomunikasi) {
      throw new BadRequestException(
        'Nilai maksimum tidak valid untuk normalisasi',
      );
    }

    const normalizedMatrix: NormalizedMatrixItem[] = alternatives.map((a) => ({
      mitraNama: a.mitraNama,
      n_ketepatan_waktu: Number((a.ketepatan_waktu / maxWaktu).toFixed(4)),
      n_kualitas: Number((a.kualitas / maxKualitas).toFixed(4)),
      n_komunikasi: Number((a.komunikasi / maxKomunikasi).toFixed(4)),
    }));

    /* ================= SCORING ================= */

    const ranked: PerformanceResultItem[] = alternatives
      .map((a) => {
        const score =
          PERFORMANCE_WEIGHTS.ketepatan_waktu * (a.ketepatan_waktu / maxWaktu) +
          PERFORMANCE_WEIGHTS.kualitas * (a.kualitas / maxKualitas) +
          PERFORMANCE_WEIGHTS.komunikasi * (a.komunikasi / maxKomunikasi);

        const rounded = Number(score.toFixed(4));

        return {
          ...a,
          nilaiPreferensi: rounded,
          peringkat: 0,
          kategori: getKategori(rounded),
        };
      })
      .sort((a, b) => b.nilaiPreferensi - a.nilaiPreferensi)
      .map((r, index) => ({
        ...r,
        peringkat: index + 1,
      }));

    return {
      tahun,
      bulan,
      metode: 'SAW - Performance Evaluation',
      totalAlternatif: ranked.length,
      normalizedMatrix,
      hasil: ranked,
    };
  }

  /* =========================================================
     SAVE PENILAIAN
  ========================================================= */

  async savePenilaian(dto: SavePenilaianDto): Promise<PenilaianMitra> {
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id: dto.spkDocumentId },
    });

    if (!spk) {
      throw new BadRequestException('SPK tidak ditemukan');
    }

    return this.prisma.penilaianMitra.upsert({
      where: {
        spk_document_id_mitra_id: {
          spk_document_id: spk.id,
          mitra_id: spk.mitra_id,
        },
      },
      update: {
        ketepatan_waktu: dto.ketepatan_waktu,
        kualitas: dto.kualitas,
        komunikasi: dto.komunikasi,
      },
      create: {
        spk_document_id: spk.id,
        mitra_id: spk.mitra_id,
        ketepatan_waktu: dto.ketepatan_waktu,
        kualitas: dto.kualitas,
        komunikasi: dto.komunikasi,
      },
    });
  }
}
