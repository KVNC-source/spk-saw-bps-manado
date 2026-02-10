import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

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

  private generateDraftNomorSpk(tahun: number): string {
    return `DRAFT-SPK/${tahun}/${Date.now()}`;
  }

  private terbilang(n: number): string {
    if (n === 0) return '';

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
    if (n < 100) {
      const sisa = n % 10;
      return sisa === 0
        ? `${satuan[Math.floor(n / 10)]} Puluh`
        : `${satuan[Math.floor(n / 10)]} Puluh ${this.terbilang(sisa)}`;
    }

    if (n < 200) return `Seratus ${this.terbilang(n - 100)}`.trim();
    if (n < 1000) {
      const sisa = n % 100;
      return sisa === 0
        ? `${satuan[Math.floor(n / 100)]} Ratus`
        : `${satuan[Math.floor(n / 100)]} Ratus ${this.terbilang(sisa)}`;
    }

    if (n < 2000) return `Seribu ${this.terbilang(n - 1000)}`.trim();

    if (n < 1_000_000) {
      const sisa = n % 1000;
      return sisa === 0
        ? `${this.terbilang(Math.floor(n / 1000))} Ribu`
        : `${this.terbilang(Math.floor(n / 1000))} Ribu ${this.terbilang(sisa)}`;
    }

    if (n < 1_000_000_000) {
      const sisa = n % 1_000_000;
      return sisa === 0
        ? `${this.terbilang(Math.floor(n / 1_000_000))} Juta`
        : `${this.terbilang(Math.floor(n / 1_000_000))} Juta ${this.terbilang(sisa)}`;
    }

    return '';
  }

  private async generateApprovedSpkNumber(tx: PrismaService, tahun: number) {
    const last = await tx.alokasiMitra.aggregate({
      _max: { nomor_urut: true },
      where: { tahun },
    });

    const nextNomor = (last._max.nomor_urut ?? 0) + 1;
    const nomorSpk = `${nextNomor}/71710/${tahun}`;

    return {
      nomor_urut: nextNomor,
      nomor_spk: nomorSpk,
    };
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
    tanggal_pembayaran?: string;
  }) {
    const {
      tahun,
      bulan,
      mitraId,
      spkKegiatan,
      spkRoleId,
      tanggalMulai,
      tanggalSelesai,
      tanggal_pembayaran,
    } = params;

    const role = await this.prisma.spkRole.findUnique({
      where: { id: spkRoleId },
    });

    if (!role || !role.aktif) {
      throw new BadRequestException('Role SPK tidak valid atau tidak aktif');
    }

    return this.prisma.spkDocument.create({
      data: {
        tahun,
        bulan,
        mitra_id: mitraId,
        nomor_spk: this.generateDraftNomorSpk(tahun),
        spk_kegiatan: spkKegiatan,
        spk_role_id: role.id,
        spk_role: role.nama_role,
        total_honorarium: 0, // calculated later
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        tanggal_pembayaran,
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

    const alokasi = await this.prisma.alokasiMitra.findUnique({
      where: { spk_document_id: spkId },
    });

    if (!alokasi) {
      throw new BadRequestException(
        'SPK belum disetujui atau belum memiliki nomor resmi',
      );
    }

    const items = await this.prisma.spkDocumentItem.findMany({
      where: { spk_document_id: spkId },
      include: {
        kegiatan: { include: { mataAnggaran: true } },
      },
      orderBy: { id: 'asc' },
    });

    const totalNilai = items.reduce((sum, i) => sum + Number(i.nilai), 0);

    return {
      // ===== HEADER =====
      nomor_spk: alokasi.nomor_spk,
      spk_kegiatan: spk.spk_kegiatan,
      tahun_spk: spk.tahun,

      // ===== LEGAL DATES =====
      tanggal_perjanjian: spk.tanggal_perjanjian ?? '',
      tanggal_pembayaran: spk.tanggal_pembayaran ?? '',

      // 🔥 THIS IS THE FIX — SAME FIELDS, NEW FORMAT
      tanggal_mulai: this.formatTanggalTerbilang(spk.tanggal_mulai),
      tanggal_selesai: this.formatTanggalTerbilang(spk.tanggal_selesai),

      // ===== PEJABAT =====
      nama_pejabat_bps: 'Arista Roza Belawan, SST',
      alamat_bps:
        'Jalan Mangga III Kelurahan Bumi Nyiur Kecamatan Wanea Kota Manado',

      // ===== MITRA =====
      nama_mitra: spk.mitra.nama_mitra,
      alamat_mitra: spk.mitra.alamat ?? '-',

      // ===== TOTAL =====
      total_honorarium: totalNilai.toLocaleString('id-ID'),
      terbilang: this.terbilang(totalNilai) + ' Rupiah',

      // ===== LAMPIRAN =====
      lampiran_rows: items.map((item, index) => ({
        no: index + 1,
        uraian_tugas: item.kegiatan.nama_kegiatan,
        jangka_waktu: this.formatTanggalRange(
          spk.tanggal_mulai,
          spk.tanggal_selesai,
        ),
        volume: Number(item.volume),
        satuan: item.kegiatan.satuan ?? 'Dok',
        harga_satuan: Number(item.harga_satuan),
        nilai: Number(item.nilai),
        beban_anggaran: item.kegiatan.mataAnggaran.kode_anggaran,
      })),
    };
  }

  /* =====================================================
   * DASHBOARD SUMMARY (READ ONLY)
   * ===================================================== */

  async getDashboardSummary(): Promise<{
    totalMitra: number;
    totalKegiatan: number;
    totalAlokasi: number;
    alokasiApproved: number;
    alokasiDraft: number;
    totalAnggaran: number;
    totalAnggaranApproved: number;
    lastSpk: {
      id: number;
      nomor_spk: string;
      mitra: string;
      created_at: Date;
    } | null;
    aktivitasTerakhir: {
      tanggal: Date;
      kegiatan: string;
      mitra: string;
      status: string;
    }[];
  }> {
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
        _sum: { total_nilai: true },
      }),

      this.prisma.alokasiMitra.aggregate({
        where: { status: 'APPROVED' },
        _sum: { total_nilai: true },
      }),

      this.prisma.spkDocument.findFirst({
        orderBy: { created_at: 'desc' },
        include: {
          mitra: { select: { nama_mitra: true } },
        },
      }),

      this.prisma.spkDocumentItem.findMany({
        take: 10,
        orderBy: { id: 'desc' },
        include: {
          kegiatan: true,
          spkDocument: {
            include: { mitra: true },
          },
        },
      }),
    ]);

    return {
      totalMitra,
      totalKegiatan,
      totalAlokasi,
      alokasiApproved,
      alokasiDraft,

      totalAnggaran: Number(totalAnggaran._sum.total_nilai ?? 0),
      totalAnggaranApproved: Number(
        totalAnggaranApproved._sum.total_nilai ?? 0,
      ),

      lastSpk: lastSpk
        ? {
            id: lastSpk.id,
            nomor_spk: lastSpk.nomor_spk,
            mitra: lastSpk.mitra.nama_mitra,
            created_at: lastSpk.created_at,
          }
        : null,

      aktivitasTerakhir: aktivitasTerakhir.map((a) => ({
        tanggal: a.spkDocument.created_at,
        kegiatan: a.kegiatan.nama_kegiatan,
        mitra: a.spkDocument.mitra.nama_mitra,
        status: a.spkDocument.status,
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
        spkDocument: true,
      },
    });

    return data.map((a) => ({
      id: a.id,
      mitraId: a.mitra_id,
      mitraNama: a.mitra.nama_mitra,
      pekerjaan: a.spkDocument.spk_kegiatan,
      lokasi: '-',
      nilaiKontrak: Number(a.total_nilai),
    }));
  }

  private buildSpkTitle(kegiatanNames: string[]): string {
    return kegiatanNames.join(', ');
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

  private formatTanggalSingkat(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }

  private formatTanggalRange(mulai: Date, selesai: Date): string {
    const format = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    };

    return `${format(mulai)} s.d ${format(selesai)}`;
  }

  private formatTanggalTerbilang(d: Date): string {
    const hari = d.getDate();
    const tahun = d.getFullYear();

    const bulan = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    return `${hari} ${bulan[d.getMonth()]} ${tahun}`;
  }

  /* =====================================================
   * SPK DETAIL
   * ===================================================== */
  async getSpkById(spkId: number) {
    /* ===============================
     * 1️⃣ FETCH SPK DOCUMENT
     * =============================== */
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id: spkId },
      include: {
        mitra: true,
        spkRole: true,
      },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    /* ===============================
     * 2️⃣ FETCH ALOKASI (OPTIONAL)
     * =============================== */
    const alokasi = await this.prisma.alokasiMitra.findUnique({
      where: {
        spk_document_id: spkId,
      },
    });

    /**
     * 🔑 FINAL NUMBER RULE
     * - If APPROVED → use alokasi.nomor_spk
     * - Else → use draft nomor from spk_document
     */
    const nomorSpkFinal = alokasi ? alokasi.nomor_spk : spk.nomor_spk;

    /* ===============================
     * 3️⃣ FETCH ITEMS
     * =============================== */
    const items = await this.prisma.spkDocumentItem.findMany({
      where: { spk_document_id: spk.id },
      include: { kegiatan: true },
    });

    /* ===============================
     * 4️⃣ RETURN FINAL RESPONSE
     * =============================== */
    return {
      id: spk.id,
      nomor_spk: nomorSpkFinal,
      tahun: spk.tahun,
      bulan: spk.bulan,
      spk_kegiatan: spk.spk_kegiatan,
      status: spk.status,
      tanggal_pembayaran: spk.tanggal_pembayaran,

      mitra: {
        id: spk.mitra.id,
        nama_mitra: spk.mitra.nama_mitra,
        alamat: spk.mitra.alamat ?? '-',
      },

      spk_role: spk.spkRole.nama_role,

      tanggal_mulai: spk.tanggal_mulai,
      tanggal_selesai: spk.tanggal_selesai,

      total_honorarium: Number(spk.total_honorarium),

      kegiatan: items.map((i) => ({
        kegiatan_id: i.kegiatan_id,
        nama_kegiatan: i.kegiatan.nama_kegiatan,
        volume: Number(i.volume),
        harga_satuan: Number(i.harga_satuan),
        nilai: Number(i.nilai),
      })),

      dibuat_pada: spk.created_at,
      approved_at: spk.approved_at,
      approved_by: spk.approved_by,
    };
  }

  async createManualSpk(data: {
    mitra_id: number;
    tanggal_mulai: string;
    tanggal_selesai: string;
    tanggal_perjanjian?: string;
    tanggal_pembayaran?: string;
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

    return this.prisma.$transaction(async (tx) => {
      const spk = await tx.spkDocument.create({
        data: {
          tahun: tanggalMulai.getFullYear(),
          bulan: tanggalMulai.getMonth() + 1,
          mitra_id: data.mitra_id,
          nomor_spk: this.generateDraftNomorSpk(tanggalMulai.getFullYear()),
          spk_kegiatan: spkTitle,
          spk_role_id: role.id,
          spk_role: role.nama_role,
          total_honorarium: totalHonorarium,
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalSelesai,
          tanggal_perjanjian: data.tanggal_perjanjian,
          tanggal_pembayaran: data.tanggal_pembayaran,
        },
      });

      await tx.spkDocumentItem.createMany({
        data: data.kegiatan.map((item) => {
          const kegiatan = kegiatanList.find((k) => k.id === item.kegiatan_id)!;

          return {
            spk_document_id: spk.id,
            kegiatan_id: kegiatan.id,
            mata_anggaran_id: kegiatan.mata_anggaran_id,
            jangka_waktu: '1',
            volume: item.volume,
            harga_satuan: kegiatan.tarif_per_satuan!,
            nilai: item.volume * kegiatan.tarif_per_satuan!,
          };
        }),
      });

      return spk;
    });
  }
  /* =====================================================
   * DASHBOARD SUMMARY — ADMIN
   * ===================================================== */
  async getAdminDashboardSummary(): Promise<{
    totalMitra: number;
    totalKegiatan: number;
    totalAlokasi: number;
    alokasiApproved: number;
    alokasiDraft: number;
    totalAnggaran: number;
    totalAnggaranApproved: number;
    lastSpk: {
      id: number;
      nomor_spk: string;
      mitra: string;
      created_at: Date;
    } | null;
    aktivitasTerakhir: {
      tanggal: Date;
      kegiatan: string;
      mitra: string;
      status: string;
    }[];
  }> {
    // ADMIN sees global dashboard
    return this.getDashboardSummary();
  }

  /* =====================================================
   * DASHBOARD SUMMARY — MITRA
   * ===================================================== */
  async getDashboardSummaryByMitra(mitraId: number): Promise<{
    totalMitra: number;
    totalKegiatan: number;
    totalAlokasi: number;
    alokasiApproved: number;
    alokasiDraft: number;
    totalAnggaran: number;
    totalAnggaranApproved: number;
    lastSpk: {
      id: number;
      nomor_spk: string;
      mitra: string;
      created_at: Date;
    } | null;
    aktivitasTerakhir: {
      tanggal: Date;
      kegiatan: string;
      mitra: string;
      status: string;
    }[];
  }> {
    if (!mitraId) {
      throw new BadRequestException('Invalid mitra');
    }

    // For now, reuse global dashboard logic
    return this.getDashboardSummary();
  }

  async updateLegalDates(
    id: number,
    data: {
      tanggal_perjanjian?: string;
      tanggal_pembayaran?: string;
    },
  ) {
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    if (spk.status === 'APPROVED') {
      throw new BadRequestException(
        'Tanggal tidak dapat diubah setelah SPK disetujui',
      );
    }

    return this.prisma.spkDocument.update({
      where: { id },
      data: {
        ...(data.tanggal_perjanjian !== undefined && {
          tanggal_perjanjian: data.tanggal_perjanjian,
        }),
        ...(data.tanggal_pembayaran !== undefined && {
          tanggal_pembayaran: data.tanggal_pembayaran,
        }),
      },
    });
  }
}
