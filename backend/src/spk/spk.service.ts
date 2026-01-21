import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * FINAL SPK SERVICE
 * - Snapshot-based
 * - Word-identical output
 * - DB-safe & TA-safe
 */
@Injectable()
export class SpkService {
  constructor(private readonly prisma: PrismaService) {}

  /* =====================================================
   * UTILITIES
   * ===================================================== */

  /**
   * Generate Nomor SPK (BPS official format)
   * Example: SPK-110/71710/2025
   */
  private generateNomorSpk(tahun: number): string {
    const KODE_UNIT = '110/71710';
    return `SPK-${KODE_UNIT}/${tahun}`;
  }

  /**
   * Convert number to Indonesian words (TERBILANG)
   * Minimal but sufficient for honorarium
   */
  private terbilang(n: number): string {
    const satuan = [
      '',
      'Satu',
      'Dua',
      'Tiga',
      'Empat',
      'Lima',
      'Enam',
      'Tujuh',
      'Delapan',
      'Sembilan',
      'Sepuluh',
      'Sebelas',
    ];

    if (n < 12) return satuan[n];
    if (n < 20) return `${satuan[n - 10]} Belas`;
    if (n < 100) return `${satuan[Math.floor(n / 10)]} Puluh ${satuan[n % 10]}`;
    if (n < 200) return `Seratus ${this.terbilang(n - 100)}`;
    if (n < 1000)
      return `${satuan[Math.floor(n / 100)]} Ratus ${this.terbilang(n % 100)}`;
    if (n < 2000) return `Seribu ${this.terbilang(n - 1000)}`;
    if (n < 1000000)
      return `${this.terbilang(Math.floor(n / 1000))} Ribu ${this.terbilang(
        n % 1000,
      )}`;

    return '';
  }

  /* =====================================================
   * 1️⃣ CREATE SPK SNAPSHOT (IMMUTABLE)
   * ===================================================== */

  async createSpk(params: {
    tahun: number;
    bulan: number;
    mitraId: number;
    spkKegiatan: string;
    spkRoleId: number;
    sawResultId?: number;
  }) {
    const { tahun, bulan, mitraId, spkKegiatan, spkRoleId, sawResultId } =
      params;

    /* ───────── Validate role ───────── */
    const role = await this.prisma.spkRole.findUnique({
      where: { id: spkRoleId },
    });

    if (!role || !role.aktif) {
      throw new BadRequestException('Role SPK tidak valid atau tidak aktif');
    }

    /* ───────── Prevent duplicate ───────── */
    const existing = await this.prisma.spkDocument.findFirst({
      where: { tahun, bulan, mitra_id: mitraId },
    });

    if (existing) {
      throw new BadRequestException(
        'SPK untuk mitra dan periode ini sudah ada',
      );
    }

    /* ───────── Aggregate honor (APPROVED only) ───────── */
    const aggregate = await this.prisma.alokasiMitra.aggregate({
      where: {
        tahun,
        bulan,
        mitra_id: mitraId,
        status: 'APPROVED',
      },
      _sum: { jumlah: true },
    });

    if (!aggregate._sum.jumlah || Number(aggregate._sum.jumlah) <= 0) {
      throw new BadRequestException(
        'Tidak ada alokasi APPROVED untuk mitra ini',
      );
    }

    /* ───────── Persist snapshot ───────── */
    return this.prisma.spkDocument.create({
      data: {
        tahun,
        bulan,
        mitra_id: mitraId,
        total_honorarium: aggregate._sum.jumlah,
        nomor_spk: this.generateNomorSpk(tahun),
        spk_kegiatan: spkKegiatan,
        spk_role_id: role.id,
        spk_role: role.nama_role,
        ...(sawResultId && { saw_result_id: sawResultId }),
      },
    });
  }

  /* =====================================================
   * 2️⃣ BUILD FULL DATA FOR HTML → PDF
   * ===================================================== */

  async buildSpkPdfData(spkId: number) {
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id: spkId },
      include: { mitra: true },
    });

    if (!spk) {
      throw new BadRequestException('SPK tidak ditemukan');
    }

    /* ───────── Static BPS Identity ───────── */
    const pejabat = {
      nama: 'Arista Roza Belawan, SST',
      jabatan: 'Pejabat Pembuat Komitmen',
      alamat:
        'Jalan Mangga III Kelurahan Bumi Nyiur Kecamatan Wanea Kota Manado',
    };

    /* ───────── Date Formatting ───────── */
    const tanggalSpk = new Date(spk.tahun, spk.bulan - 1, 3);

    const hariSpk = tanggalSpk.toLocaleDateString('id-ID', {
      weekday: 'long',
    });

    const bulanSpk = tanggalSpk.toLocaleDateString('id-ID', {
      month: 'long',
    });

    /* ───────── Lampiran rows (REAL DB DATA) ───────── */
    const lampiran = await this.prisma.$queryRaw<
      {
        nama_kegiatan: string;
        volume: number;
        tarif: number;
        jumlah: number;
        kode_anggaran: string;
        tanggal_mulai: string;
        tanggal_selesai: string;
        satuan: string;
      }[]
    >`
    SELECT
      k.nama_kegiatan,
      a.volume,
      a.tarif,
      a.jumlah,
      ma.kode_anggaran,
      TO_CHAR(a.created_at, 'DD/MM/YY') AS tanggal_mulai,
      TO_CHAR(a.created_at + INTERVAL '30 day', 'DD/MM/YY') AS tanggal_selesai,
      k.satuan
    FROM spk.alokasi_mitra a
    JOIN spk.kegiatan k ON k.id = a.kegiatan_id
    JOIN spk.mata_anggaran ma ON ma.id = k.mata_anggaran_id
    WHERE a.mitra_id = ${spk.mitra_id}
      AND a.tahun = ${spk.tahun}
      AND a.bulan = ${spk.bulan}
      AND a.status = 'APPROVED'
    ORDER BY k.id;
    `;

    const lampiranRows = lampiran.map((r, i) => ({
      no: i + 1,
      uraian: r.nama_kegiatan,
      jangkaWaktu: `${r.tanggal_mulai} s.d ${r.tanggal_selesai}`,
      volume: r.volume,
      satuan: r.satuan,
      hargaSatuan: r.tarif,
      nilai: r.jumlah,
      kodeAnggaran: r.kode_anggaran,
    }));

    /* ───────── FINAL OBJECT (HTML CONTRACT) ───────── */
    return {
      nomor_spk: spk.nomor_spk,

      hari_spk: hariSpk,
      tanggal_spk: tanggalSpk.getDate().toString(),
      bulan_spk: bulanSpk,
      tahun_spk: spk.tahun,

      nama_pejabat_bps: pejabat.nama,
      jabatan_pejabat_bps: pejabat.jabatan,
      alamat_bps: pejabat.alamat,

      nama_mitra: spk.mitra.nama_mitra,
      alamat_mitra: spk.mitra.alamat ?? '-',

      tanggal_mulai: lampiranRows[0]?.jangkaWaktu.split(' s.d ')[0] ?? '',
      tanggal_selesai: lampiranRows[0]?.jangkaWaktu.split(' s.d ')[1] ?? '',

      // LAMPIRAN
      lampiran_rows: lampiranRows,
      total_honorarium: Number(spk.total_honorarium),
      terbilang: `${this.terbilang(Number(spk.total_honorarium))} Rupiah`,
    };
  }
}
