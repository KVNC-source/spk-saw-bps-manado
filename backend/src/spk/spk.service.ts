import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateAlokasiDto } from './dto/create-alokasi.dto';
import { GenerateSpkDto } from './dto/generate-spk.dto';

/**
 * FINAL SPK SERVICE
 * - Snapshot-based
 * - Immutable
 * - TA safe
 */
@Injectable()
export class SpkService {
  constructor(private readonly prisma: PrismaService) {}

  /* =====================================================
   * UTILITIES
   * ===================================================== */

  private generateNomorSpk(tahun: number): string {
    return `SPK-110/71710/${tahun}`;
  }

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
    if (n < 1_000_000)
      return `${this.terbilang(Math.floor(n / 1000))} Ribu ${this.terbilang(
        n % 1000,
      )}`;

    return '';
  }

  /* =====================================================
   * CREATE SPK (SNAPSHOT)
   * ===================================================== */

  async createSpk(params: {
    tahun: number;
    bulan: number;
    mitraId: number;
    spkKegiatan: string;
    spkRoleId: number;
    tanggalMulai: Date;
    tanggalSelesai: Date;
    kegiatanIds: number[];
    sawResultId?: number;
  }) {
    const {
      tahun,
      bulan,
      mitraId,
      spkKegiatan,
      spkRoleId,
      tanggalMulai,
      tanggalSelesai,
      kegiatanIds,
      sawResultId,
    } = params;

    if (!kegiatanIds.length) {
      throw new BadRequestException('kegiatanIds tidak boleh kosong');
    }

    const role = await this.prisma.spkRole.findUnique({
      where: { id: spkRoleId },
    });

    if (!role || !role.aktif) {
      throw new BadRequestException('Role SPK tidak valid atau tidak aktif');
    }

    const aggregate = await this.prisma.alokasiMitra.aggregate({
      where: {
        tahun,
        bulan,
        mitra_id: mitraId,
        status: 'APPROVED',
        kegiatan_id: { in: kegiatanIds },
      },
      _sum: { jumlah: true },
    });

    if (!aggregate._sum.jumlah) {
      throw new BadRequestException(
        'Tidak ada alokasi APPROVED untuk mitra dan kegiatan ini',
      );
    }

    return this.prisma.spkDocument.create({
      data: {
        tahun,
        bulan,
        mitra_id: mitraId,
        nomor_spk: this.generateNomorSpk(tahun),
        spk_kegiatan: spkKegiatan,
        spk_role_id: role.id,
        spk_role: role.nama_role,
        total_honorarium: aggregate._sum.jumlah,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        kegiatan_ids: kegiatanIds,
        ...(sawResultId && { saw_result_id: sawResultId }),
      },
    });
  }

  /* =====================================================
   * BUILD PDF DATA (READ ONLY)
   * ===================================================== */

  async buildSpkPdfData(spkId: number) {
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id: spkId },
      include: { mitra: true },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    const pejabat = {
      nama: 'Arista Roza Belawan, SST',
      jabatan: 'Pejabat Pembuat Komitmen',
      alamat:
        'Jalan Mangga III Kelurahan Bumi Nyiur Kecamatan Wanea Kota Manado',
    };

    const totalHonorarium = Number(spk.total_honorarium);

    /* =====================================================
     * SNAPSHOT LAMPIRAN (FROM APPROVED ALOKASI)
     * ===================================================== */
    console.log('SPK FILTER DEBUG', {
      mitra_id: spk.mitra_id,
      tahun: spk.tahun,
      bulan: spk.bulan,
      kegiatan_ids: spk.kegiatan_ids,
    });

    const alokasi = await this.prisma.alokasiMitra.findMany({
      where: {
        mitra_id: spk.mitra_id,
        tahun: spk.tahun,
        status: 'APPROVED',
        kegiatan_id: { in: spk.kegiatan_ids },
      },
      include: {
        kegiatan: true,
      },
    });

    if (alokasi.length === 0) {
      throw new BadRequestException(
        'Lampiran kosong: tidak ada alokasi APPROVED yang cocok dengan SPK ini',
      );
    }

    console.log('ALOKASI FOUND:', alokasi.length);

    const lampiranRows = alokasi.map((a) => ({
      uraian_tugas: a.kegiatan.nama_kegiatan,

      jangka_waktu:
        spk.tanggal_mulai.toLocaleDateString('id-ID') +
        ' s.d ' +
        spk.tanggal_selesai.toLocaleDateString('id-ID'),

      volume: a.volume,
      satuan: a.kegiatan.satuan ?? 'Dok',

      harga_satuan: a.tarif,
      nilai: Number(a.jumlah),

      beban_anggaran: 'DIPA BPS',
    }));

    console.log(
      'LAMPIRAN ROW SAMPLE:',
      JSON.stringify(lampiranRows[0], null, 2),
    );

    const tanggalSpk = spk.tanggal_mulai;

    return {
      nomor_spk: spk.nomor_spk,
      spk_kegiatan: spk.spk_kegiatan,
      tahun_spk: spk.tahun,
      hari_spk: tanggalSpk.toLocaleDateString('id-ID', { weekday: 'long' }),
      tanggal_spk: tanggalSpk.getDate(),
      bulan_spk: tanggalSpk.toLocaleDateString('id-ID', { month: 'long' }),

      nama_pejabat_bps: pejabat.nama,
      jabatan_pejabat_bps: pejabat.jabatan,
      alamat_bps: pejabat.alamat,

      nama_mitra: spk.mitra.nama_mitra,
      alamat_mitra: spk.mitra.alamat ?? '-',

      tanggal_mulai: spk.tanggal_mulai.toLocaleDateString('id-ID'),
      tanggal_selesai: spk.tanggal_selesai.toLocaleDateString('id-ID'),

      lampiran_rows: lampiranRows,

      total_honorarium: totalHonorarium.toLocaleString('id-ID'),
      terbilang: this.terbilang(totalHonorarium) + ' Rupiah',
    };
  }

  /* =====================================================
   * DASHBOARD SUMMARY (READ ONLY)
   * ===================================================== */

  async getDashboardSummary() {
    const [
      totalMitra,
      totalKegiatan,
      totalAlokasi,
      alokasiApproved,
      alokasiDraft,
      totalAnggaran,
      totalAnggaranApproved,
      lastSpk,
      aktivitasTerakhir,
    ] = await Promise.all([
      this.prisma.mitra.count(),
      this.prisma.kegiatan.count(),
      this.prisma.alokasiMitra.count(),

      this.prisma.alokasiMitra.count({
        where: { status: 'APPROVED' },
      }),

      this.prisma.alokasiMitra.count({
        where: { status: 'PENDING' },
      }),

      this.prisma.alokasiMitra.aggregate({
        _sum: { jumlah: true },
      }),

      this.prisma.alokasiMitra.aggregate({
        where: { status: 'APPROVED' },
        _sum: { jumlah: true },
      }),

      this.prisma.spkDocument.findFirst({
        orderBy: { created_at: 'desc' },
        include: {
          mitra: { select: { nama_mitra: true } },
        },
      }),

      this.prisma.alokasiMitra.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          mitra: { select: { nama_mitra: true } },
          kegiatan: { select: { nama_kegiatan: true } },
        },
      }),
    ]);

    return {
      totalMitra,
      totalKegiatan,

      totalAlokasi,
      alokasiApproved,
      alokasiDraft,

      totalAnggaran: totalAnggaran._sum.jumlah ?? 0,
      totalAnggaranApproved: totalAnggaranApproved._sum.jumlah ?? 0,

      lastSpk,

      aktivitasTerakhir: aktivitasTerakhir.map((a) => ({
        tanggal: a.created_at,
        kegiatan: a.kegiatan.nama_kegiatan,
        mitra: a.mitra.nama_mitra,
        status: a.status,
      })),
    };
  }
  /* ===============================
   * ALOKASI APPROVED
   * =============================== */
  async getApprovedAlokasi(
    tahun?: number,
    bulan?: number,
  ): Promise<
    {
      id: number;
      mitraId: number;
      mitraNama: string;
      pekerjaan: string;
      lokasi: string;
      nilaiKontrak: number;
    }[]
  > {
    const where: any = {
      status: 'APPROVED',
    };

    if (tahun) where.tahun = tahun;
    if (bulan) where.bulan = bulan;

    const data = await this.prisma.alokasiMitra.findMany({
      where,
      include: {
        mitra: { select: { nama_mitra: true } },
        kegiatan: { select: { nama_kegiatan: true } },
      },
      orderBy: { created_at: 'asc' },
    });

    return data.map((a) => ({
      id: a.id,
      mitraId: a.mitra_id,
      mitraNama: a.mitra.nama_mitra,
      pekerjaan: a.kegiatan.nama_kegiatan,
      lokasi: '-',
      nilaiKontrak: Number(a.jumlah),
    }));
  }

  async createAlokasi(dto: CreateAlokasiDto) {
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: dto.kegiatan_id },
    });

    if (!kegiatan) {
      throw new BadRequestException('Kegiatan tidak ditemukan');
    }

    const jumlah = dto.volume * dto.tarif;

    return this.prisma.alokasiMitra.create({
      data: {
        tahun: dto.tahun,
        bulan: dto.bulan,
        mitra_id: dto.mitra_id,
        kegiatan_id: dto.kegiatan_id,
        volume: dto.volume,
        tarif: dto.tarif,
        jumlah,
        status: 'PENDING',
      },
    });
  }
  async approveAlokasi(id: number) {
    const alokasi = await this.prisma.alokasiMitra.findUnique({
      where: { id },
    });

    if (!alokasi) {
      throw new NotFoundException('Alokasi tidak ditemukan');
    }

    if (alokasi.status === 'APPROVED') {
      return alokasi; // idempotent: already approved
    }

    return this.prisma.alokasiMitra.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
    });
  }

  private buildSpkTitle(kegiatanNames: string[]): string {
    return kegiatanNames.join(', ');
  }

  async generateSpk(dto: GenerateSpkDto) {
    // ✅ Normalize period ONCE
    const now = new Date();
    const tahun = dto.tahun ?? now.getFullYear();
    const bulan = dto.bulan ?? now.getMonth() + 1;

    const alokasiList = await this.prisma.alokasiMitra.findMany({
      where: {
        tahun,
        bulan,
        status: 'APPROVED',
      },
      include: {
        mitra: true,
        kegiatan: true,
      },
    });

    if (alokasiList.length === 0) {
      throw new BadRequestException(
        'Tidak ada alokasi APPROVED untuk periode ini',
      );
    }

    /**
     * Group alokasi per mitra
     */
    const grouped = new Map<number, typeof alokasiList>();

    for (const alokasi of alokasiList) {
      if (!grouped.has(alokasi.mitra_id)) {
        grouped.set(alokasi.mitra_id, []);
      }
      grouped.get(alokasi.mitra_id)!.push(alokasi);
    }

    const results: {
      spkId: number;
      mitra: string;
      total_honorarium: number;
    }[] = [];

    for (const [mitraId, items] of grouped.entries()) {
      const totalHonorarium = items.reduce(
        (sum, a) => sum + Number(a.jumlah),
        0,
      );

      const kegiatanIds = items.map((a) => a.kegiatan_id);

      const kegiatanList = await this.prisma.kegiatan.findMany({
        where: {
          id: { in: kegiatanIds },
        },
        select: {
          nama_kegiatan: true,
        },
      });

      const spkTitle = this.buildSpkTitle(
        kegiatanList.map((k) => k.nama_kegiatan),
      );

      const role = await this.prisma.spkRole.findFirst({
        where: { kode_role: 'MITRA', aktif: true },
      });

      if (!role) {
        throw new BadRequestException('Role MITRA tidak ditemukan');
      }

      const spk = await this.createSpk({
        tahun, // ✅ number
        bulan, // ✅ number
        mitraId,
        spkKegiatan: spkTitle,
        spkRoleId: role.id,
        tanggalMulai: new Date(),
        tanggalSelesai: new Date(),
        kegiatanIds,
      });

      results.push({
        spkId: spk.id,
        mitra: items[0].mitra.nama_mitra,
        total_honorarium: totalHonorarium,
      });
    }

    return {
      tahun,
      bulan,
      total_spk: results.length,
      spk: results,
    };
  }
  /* =====================================================
   * SPK LIST (APPROVAL PAGE)
   * ===================================================== */
  async getAllSpk() {
    return this.prisma.spkDocument.findMany({
      include: {
        mitra: {
          select: {
            nama_mitra: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
  /* =====================================================
   * SPK DETAIL
   * ===================================================== */
  async getSpkById(id: number) {
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id },
      include: {
        mitra: true,
      },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    return spk;
  }
  async createManualSpk(data: {
    mitra_id: number;
    tanggal_mulai: string;
    tanggal_selesai: string;
    kegiatan: {
      kegiatan_id: number;
      volume: number;
    }[];
  }) {
    if (!data.kegiatan || data.kegiatan.length === 0) {
      throw new BadRequestException('Minimal satu kegiatan harus dipilih');
    }

    const tanggalMulai = new Date(data.tanggal_mulai);
    const tanggalSelesai = new Date(data.tanggal_selesai);

    if (isNaN(tanggalMulai.getTime()) || isNaN(tanggalSelesai.getTime())) {
      throw new BadRequestException('Tanggal SPK tidak valid');
    }

    const role = await this.prisma.spkRole.findFirst({
      where: { kode_role: 'MITRA', aktif: true },
    });

    if (!role) {
      throw new BadRequestException(
        'Role MITRA tidak ditemukan atau tidak aktif',
      );
    }

    const kegiatanIds = data.kegiatan.map((k) => k.kegiatan_id);

    const kegiatanList = await this.prisma.kegiatan.findMany({
      where: { id: { in: kegiatanIds } },
    });

    if (kegiatanList.length !== kegiatanIds.length) {
      throw new BadRequestException('Salah satu kegiatan tidak ditemukan');
    }

    let totalHonorarium = 0;

    for (const item of data.kegiatan) {
      const kegiatan = kegiatanList.find((k) => k.id === item.kegiatan_id);

      if (!kegiatan || !kegiatan.tarif_per_satuan) {
        throw new BadRequestException('Tarif kegiatan tidak valid');
      }

      totalHonorarium += item.volume * kegiatan.tarif_per_satuan;
    }

    const spkTitle = kegiatanList.map((k) => k.nama_kegiatan).join(', ');

    return this.prisma.spkDocument.create({
      data: {
        tahun: tanggalMulai.getFullYear(),
        bulan: tanggalMulai.getMonth() + 1,

        mitra_id: data.mitra_id,
        nomor_spk: this.generateNomorSpk(tanggalMulai.getFullYear()),

        spk_kegiatan: spkTitle,

        spk_role_id: role.id,
        spk_role: role.nama_role,

        total_honorarium: totalHonorarium,

        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,

        kegiatan_ids: kegiatanIds,
      },
    });
  }
}
