import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

/* =====================================================
   🔹 ADD THIS HERE (ABOVE THE CLASS)
===================================================== */

interface SpkPdfSnapshot {
  nomor_spk: string | null;
  spk_kegiatan: string;
  tahun_spk: number;

  tanggal_perjanjian: string;
  tanggal_pembayaran: string;
  tanggal_mulai: string;
  tanggal_selesai: string;

  nama_pejabat_bps: string;
  alamat_bps: string;

  nama_mitra: string;
  alamat_mitra: string;

  total_honorarium: string;
  terbilang: string;

  lampiran_rows: any[];

  is_bast?: boolean; // optional flag for BAST
}

type KetuaRequestList = Prisma.SpkRequestGetPayload<{
  include: {
    items: true;
    spkDocument: {
      include: {
        mitra: true;
      };
    };
  };
}>;

/* =====================================================
   🔹 THEN YOUR CLASS
===================================================== */

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

  private async generateApprovedSpkNumber(
    tx: Prisma.TransactionClient,
    tahun: number,
  ) {
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
  private async assertCanModifySpkItems(spkId: number, role: Role) {
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id: spkId },
      select: { status: true },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    // 🔥 ONLY block non-admin
    if (spk.status === 'APPROVED' && role !== Role.ADMIN) {
      throw new BadRequestException(
        'SPK yang telah disetujui tidak dapat diubah',
      );
    }
  }

  /* =====================================================
   * REBUILD SPK KEGIATAN TITLE (SNAPSHOT SAFE)
   * ===================================================== */
  private async rebuildSpkKegiatan(
    tx: Prisma.TransactionClient,
    spkDocumentId: number,
  ) {
    const items = await tx.spkDocumentItem.findMany({
      where: { spk_document_id: spkDocumentId },
      include: { kegiatan: true },
      orderBy: { id: 'asc' },
    });

    if (items.length === 0) {
      await tx.spkDocument.update({
        where: { id: spkDocumentId },
        data: { spk_kegiatan: '-' },
      });
      return;
    }

    const title = items.map((i) => i.kegiatan.nama_kegiatan).join(', ');

    await tx.spkDocument.update({
      where: { id: spkDocumentId },
      data: { spk_kegiatan: title },
    });
  }

  private async rebuildSpkTotal(tx: Prisma.TransactionClient, spkId: number) {
    const items = await tx.spkDocumentItem.aggregate({
      where: { spk_document_id: spkId },
      _sum: { nilai: true },
    });

    await tx.spkDocument.update({
      where: { id: spkId },
      data: {
        total_honorarium: Number(items._sum.nilai ?? 0),
      },
    });
  }

  /* =====================================================
   * CREATE SPK (SNAPSHOT)
   * ===================================================== */

  /* =====================================================
   * BUILD PDF DATA (READ ONLY)
   * ===================================================== */

  async buildSpkPdfData(spkId: number): Promise<SpkPdfSnapshot> {
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
        kegiatan: {
          include: {
            mataAnggaran: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    const totalNilai = items.reduce((sum, i) => sum + Number(i.nilai), 0);

    return {
      nomor_spk: alokasi.nomor_spk,
      spk_kegiatan: spk.spk_kegiatan,
      tahun_spk: spk.tahun,

      // ✅ ONLY FOR PK PASAL
      tanggal_perjanjian: spk.tanggal_perjanjian ?? '',
      tanggal_pembayaran: spk.tanggal_pembayaran ?? '',
      tanggal_mulai: this.formatTanggalTerbilang(spk.tanggal_mulai),
      tanggal_selesai: this.formatTanggalTerbilang(spk.tanggal_selesai),

      nama_pejabat_bps: 'Arista Roza Belawan, SST',
      alamat_bps:
        'Jalan Mangga III Kelurahan Bumi Nyiur Kecamatan Wanea Kota Manado',

      nama_mitra: spk.mitra.nama_mitra,
      alamat_mitra: spk.mitra.alamat ?? '-',

      total_honorarium: totalNilai.toLocaleString('id-ID'),
      terbilang: this.terbilang(totalNilai) + ' Rupiah',

      // ✅ LAMPIRAN USES EXACT USER INPUT
      lampiran_rows: items.map((item, index) => ({
        no: index + 1,
        uraian_tugas: item.kegiatan.nama_kegiatan,

        // 🔥 THIS IS THE IMPORTANT CHANGE
        jangka_waktu: item.jangka_waktu,

        volume: Number(item.volume),
        satuan: item.kegiatan.satuan ?? 'Dok',
        harga_satuan: Number(item.harga_satuan),
        nilai: Number(item.nilai),
        beban_anggaran: item.kegiatan.mataAnggaran?.kode_anggaran ?? '-',
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

  /* =====================================================
   * SPK LIST (APPROVAL PAGE)
   * ===================================================== */
  async getAllSpk() {
    const data = await this.prisma.spkDocument.findMany({
      include: {
        mitra: {
          select: { nama_mitra: true },
        },
        items: {
          select: {
            nilai: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return data.map((spk) => {
      const recalculatedTotal = spk.items.reduce(
        (sum, item) => sum + Number(item.nilai ?? 0),
        0,
      );

      return {
        id: spk.id,
        tahun: spk.tahun,
        bulan: spk.bulan,
        status: spk.status,
        total_honorarium: recalculatedTotal,
        tanggal_pembayaran: spk.tanggal_pembayaran,
        created_by_user_name: spk.created_by_user_name,
        mitra: {
          nama_mitra: spk.mitra.nama_mitra,
        },
        nomor_spk: spk.nomor_spk,
      };
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
   * SPK DETAIL (FIXED TOTAL VERSION)
   * ===================================================== */
  async getSpkById(spkId: number) {
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

    const alokasi = await this.prisma.alokasiMitra.findUnique({
      where: { spk_document_id: spkId },
    });

    const nomorSpkFinal = alokasi ? alokasi.nomor_spk : spk.nomor_spk;

    // 🔥 Always fetch items
    const items = await this.prisma.spkDocumentItem.findMany({
      where: { spk_document_id: spk.id },
      include: {
        kegiatan: {
          include: {
            mataAnggaran: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    // 🔥 ALWAYS calculate total from items
    const total = items.reduce((sum, item) => sum + Number(item.nilai), 0);

    return {
      id: spk.id,
      nomor_spk: nomorSpkFinal,
      tahun: spk.tahun,
      bulan: spk.bulan,
      spk_kegiatan: spk.spk_kegiatan,
      status: spk.status,
      tanggal_pembayaran: spk.tanggal_pembayaran,
      admin_note: spk.admin_note,

      mitra: {
        id: spk.mitra.id,
        nama_mitra: spk.mitra.nama_mitra,
        alamat: spk.mitra.alamat ?? '-',
      },

      spk_role: spk.spkRole.nama_role,

      tanggal_mulai: spk.tanggal_mulai,
      tanggal_selesai: spk.tanggal_selesai,

      // ✅ FIXED HERE
      total_honorarium: total,

      kegiatan: items.map((i) => ({
        id: i.id,
        nama_kegiatan: i.kegiatan.nama_kegiatan,
        volume: Number(i.volume),
        harga_satuan: Number(i.harga_satuan),
        nilai: Number(i.nilai),

        mata_anggaran: i.kegiatan.mataAnggaran
          ? {
              kode: i.kegiatan.mataAnggaran.kode_anggaran,
              nama: i.kegiatan.mataAnggaran.nama_anggaran,
            }
          : null,
      })),

      dibuat_pada: spk.created_at,
      approved_at: spk.approved_at,
      approved_by: spk.approved_by,
    };
  }

  async createManualSpk(
    data: {
      mitra_id: number;
      tanggal_mulai: string;
      tanggal_selesai: string;
      kegiatan: {
        kegiatan_id: number;
        volume: number;
      }[];
    },
    createdByUserId: string,
  ) {
    if (!data.kegiatan || data.kegiatan.length === 0) {
      throw new BadRequestException('Minimal satu kegiatan harus dipilih');
    }

    if (!data.tanggal_mulai || !data.tanggal_selesai) {
      throw new BadRequestException('Tanggal mulai dan selesai wajib diisi');
    }

    const tanggalMulai = new Date(`${data.tanggal_mulai}T12:00:00`);
    const tanggalSelesai = new Date(`${data.tanggal_selesai}T12:00:00`);

    if (tanggalSelesai < tanggalMulai) {
      throw new BadRequestException(
        'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
      );
    }

    const tahun = tanggalMulai.getFullYear();
    const bulan = tanggalMulai.getMonth() + 1;

    // 🔥 BLOCK IF APPROVED SPK ALREADY EXISTS
    const approvedSpk = await this.prisma.spkDocument.findFirst({
      where: {
        mitra_id: data.mitra_id,
        bulan,
        tahun,
        status: 'APPROVED',
      },
    });

    if (approvedSpk) {
      throw new BadRequestException(
        'SPK untuk mitra ini pada periode tersebut sudah disetujui.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      /* ================= USER CHECK ================= */

      const user = await tx.user.findUnique({
        where: { id: createdByUserId },
        select: { name: true, role: true },
      });

      if (!user) {
        throw new BadRequestException('User tidak ditemukan');
      }

      /* ================= FIND OR CREATE SPK ================= */

      let masterSpk = await tx.spkDocument.findFirst({
        where: {
          mitra_id: data.mitra_id,
          bulan,
          tahun,
        },
      });

      let isNewSpk = false;

      if (!masterSpk) {
        const roleSpk = await tx.spkRole.findFirst({
          where: { kode_role: 'MITRA', aktif: true },
        });

        if (!roleSpk) {
          throw new BadRequestException('Role MITRA tidak ditemukan');
        }

        masterSpk = await tx.spkDocument.create({
          data: {
            tahun,
            bulan,
            mitra_id: data.mitra_id,
            created_by_user_id: createdByUserId,
            created_by_user_name: user.name,
            nomor_spk: this.generateDraftNomorSpk(tahun),
            spk_kegiatan: '-',
            spk_role_id: roleSpk.id,
            spk_role: roleSpk.nama_role,
            total_honorarium: 0,
            tanggal_mulai: tanggalMulai,
            tanggal_selesai: tanggalSelesai,
            status: 'PENDING',
          },
        });

        isNewSpk = true;
      }

      /* ================= VALIDATE KEGIATAN ================= */

      const kegiatanIds = data.kegiatan.map((k) => k.kegiatan_id);

      const kegiatanList = await tx.kegiatan.findMany({
        where: { id: { in: kegiatanIds } },
        include: { mataAnggaran: true },
      });

      if (kegiatanList.length !== kegiatanIds.length) {
        throw new BadRequestException('Salah satu kegiatan tidak ditemukan');
      }

      for (const kegiatan of kegiatanList) {
        if (!kegiatan.mataAnggaran?.is_active) {
          throw new BadRequestException(
            `Mata anggaran "${kegiatan.nama_kegiatan}" sudah tidak aktif`,
          );
        }
      }

      /* =====================================================
       ROLE SPLIT
    ===================================================== */

      // ================= ADMIN FLOW =================
      if (user.role === 'ADMIN') {
        for (const item of data.kegiatan) {
          const kegiatan = kegiatanList.find((k) => k.id === item.kegiatan_id)!;

          const tarif = kegiatan.tarif_per_satuan ?? 0;
          const nilai = item.volume * tarif;

          await tx.spkDocumentItem.create({
            data: {
              spk_document_id: masterSpk.id,
              kegiatan_id: kegiatan.id,
              mata_anggaran_id: kegiatan.mata_anggaran_id,
              jangka_waktu: this.formatTanggalRange(
                tanggalMulai,
                tanggalSelesai,
              ),
              volume: item.volume,
              harga_satuan: tarif,
              nilai,
            },
          });
        }

        // 🔥 UPDATE MASTER TOTAL
        await this.rebuildSpkTotal(tx, masterSpk.id);

        await this.rebuildSpkKegiatan(tx, masterSpk.id);

        return {
          alreadyExists: !isNewSpk,
          spk_master_id: masterSpk.id,
          mode: 'ADMIN_DIRECT',
        };
      }

      // ================= KETUA FLOW =================
      const request = await tx.spkRequest.create({
        data: {
          spk_document_id: masterSpk.id,
          created_by_user_id: createdByUserId,
          status: 'PENDING',
        },
      });

      const requestItems = data.kegiatan.map((item) => {
        const kegiatan = kegiatanList.find((k) => k.id === item.kegiatan_id)!;

        const tarif = kegiatan.tarif_per_satuan ?? 0;

        return {
          spk_request_id: request.id,
          kegiatan_id: kegiatan.id,
          volume: item.volume,
          harga_satuan: tarif,
          nilai: item.volume * tarif,
        };
      });

      await tx.spkRequestItem.createMany({
        data: requestItems,
      });

      return {
        alreadyExists: !isNewSpk,
        spk_master_id: masterSpk.id,
        mode: 'KETUA_REQUEST',
      };
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

  async addSpkItem(
    spkId: number,
    role: Role,
    data: { kegiatan_id: number; volume: number },
    userId: string,
  ) {
    /* ===============================
     * ACCESS CHECK
     * =============================== */

    if (role !== Role.ADMIN) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { mitra_id: true },
      });

      if (!user || !user.mitra_id) {
        throw new NotFoundException('User tidak memiliki mitra terhubung');
      }

      const spk = await this.prisma.spkDocument.findFirst({
        where: {
          id: spkId,
          mitra_id: user.mitra_id,
        },
      });

      if (!spk) {
        throw new NotFoundException(
          'SPK tidak ditemukan atau tidak memiliki akses',
        );
      }
    }

    await this.assertCanModifySpkItems(spkId, role);

    /* ===============================
     * VALIDATE KEGIATAN + MATA ANGGARAN
     * =============================== */

    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: data.kegiatan_id },
      include: {
        mataAnggaran: true,
      },
    });

    if (!kegiatan) {
      throw new BadRequestException('Kegiatan tidak ditemukan');
    }

    if (!kegiatan.mataAnggaran?.is_active) {
      throw new BadRequestException(
        `Mata anggaran "${kegiatan.mataAnggaran?.kode_anggaran}" sudah tidak aktif`,
      );
    }

    const tarif = kegiatan.tarif_per_satuan ?? 0;
    const nilai = data.volume * tarif;

    /* ===============================
     * TRANSACTION
     * =============================== */

    return this.prisma.$transaction(async (tx) => {
      await tx.spkDocumentItem.create({
        data: {
          spk_document_id: spkId,
          kegiatan_id: kegiatan.id,
          mata_anggaran_id: kegiatan.mata_anggaran_id,
          jangka_waktu: '1',
          volume: data.volume,
          harga_satuan: tarif,
          nilai,
        },
      });

      await this.rebuildSpkTotal(tx, spkId);

      await this.rebuildSpkKegiatan(tx, spkId);
    });
  }

  async deleteSpkItem(itemId: number, role: Role, userId: string) {
    const item = await this.prisma.spkDocumentItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item tidak ditemukan');
    }

    /* ===============================
     * ACCESS CHECK
     * =============================== */

    if (role !== Role.ADMIN) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { mitra_id: true },
      });

      if (!user || !user.mitra_id) {
        throw new NotFoundException('User tidak memiliki mitra terhubung');
      }

      const spk = await this.prisma.spkDocument.findFirst({
        where: {
          id: item.spk_document_id,
          mitra_id: user.mitra_id,
        },
      });

      if (!spk) {
        throw new NotFoundException(
          'SPK tidak ditemukan atau tidak memiliki akses',
        );
      }
    }

    await this.assertCanModifySpkItems(item.spk_document_id, role);

    /* ===============================
     * TRANSACTION
     * =============================== */

    return this.prisma.$transaction(async (tx) => {
      await tx.spkDocumentItem.delete({
        where: { id: itemId },
      });

      await this.rebuildSpkTotal(tx, item.spk_document_id);

      await this.rebuildSpkKegiatan(tx, item.spk_document_id);
    });
  }

  async getSpkByIdWithAccessCheck(spkId: number, userId: string, role: Role) {
    if (role === Role.ADMIN) {
      return this.getSpkById(spkId);
    }

    const hasRequest = await this.prisma.spkRequest.findFirst({
      where: {
        spk_document_id: spkId,
        created_by_user_id: userId,
      },
    });

    if (!hasRequest) {
      throw new NotFoundException(
        'SPK tidak ditemukan atau tidak memiliki akses',
      );
    }

    return this.getSpkById(spkId);
  }

  async getSpkByUser(userId: string): Promise<KetuaRequestList[]> {
    return this.prisma.spkRequest.findMany({
      where: {
        created_by_user_id: userId,
      },
      include: {
        spkDocument: {
          include: {
            mitra: true,
          },
        },
        items: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
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
      data,
    });
  }

  async cancelSpk(spkId: number, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { mitra_id: true },
    });

    if (!user || !user.mitra_id) {
      throw new NotFoundException('User tidak memiliki mitra terhubung');
    }

    const spk = await this.prisma.spkDocument.findFirst({
      where: {
        id: spkId,
        mitra_id: user.mitra_id,
      },
    });

    if (!spk) {
      throw new NotFoundException(
        'SPK tidak ditemukan atau tidak memiliki akses',
      );
    }

    if (spk.status !== 'PENDING') {
      throw new BadRequestException(
        'SPK hanya dapat dibatalkan jika berstatus PENDING',
      );
    }

    return this.prisma.spkDocument.update({
      where: { id: spkId },
      data: { status: 'CANCELLED' },
    });
  }

  async createKetua(data: {
    username: string;
    name: string;
    email?: string;
    password: string;
    mitra_id?: number;
  }) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Username atau email sudah digunakan');
    }

    const bcrypt = await import('bcrypt');
    const hashed = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        username: data.username,
        name: data.name,
        email: data.email,
        password: hashed,
        role: Role.KETUA_TIM,
        mitra_id: data.mitra_id ?? null,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        mitra_id: true,
        createdAt: true,
      },
    });
  }

  async getAllKetua() {
    return this.prisma.user.findMany({
      where: {
        role: Role.KETUA_TIM,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        createdAt: true,
        mitra: {
          select: {
            nama_mitra: true,
          },
        },
      },
    });
  }

  async getKetuaById(id: string) {
    const ketua = await this.prisma.user.findFirst({
      where: {
        id,
        role: Role.KETUA_TIM,
      },
    });

    if (!ketua) {
      throw new NotFoundException('Ketua tidak ditemukan');
    }

    return ketua;
  }

  async updateKetua(
    id: string,
    data: {
      username?: string;
      name?: string;
      email?: string;
      mitra_id?: number;
    },
  ) {
    const ketua = await this.prisma.user.findFirst({
      where: {
        id,
        role: Role.KETUA_TIM,
      },
    });

    if (!ketua) {
      throw new NotFoundException('Ketua tidak ditemukan');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteKetua(id: string) {
    const ketua = await this.prisma.user.findFirst({
      where: {
        id,
        role: Role.KETUA_TIM,
      },
    });

    if (!ketua) {
      throw new NotFoundException('Ketua tidak ditemukan');
    }

    const hasSpk = await this.prisma.spkDocument.count({
      where: { created_by_user_id: id },
    });

    if (hasSpk > 0) {
      throw new BadRequestException(
        'Ketua tidak dapat dihapus karena sudah memiliki SPK',
      );
    }

    const hasRequest = await this.prisma.spkRequest.count({
      where: { created_by_user_id: id },
    });

    if (hasRequest > 0) {
      throw new BadRequestException(
        'Ketua tidak dapat dihapus karena memiliki request aktif',
      );
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async approveRequestItem(
    itemId: number,
    status: 'APPROVED' | 'REJECTED',
    approvedBy: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const requestItem = await tx.spkRequestItem.findUnique({
        where: { id: itemId },
        include: {
          spkRequest: true,
          kegiatan: true,
        },
      });

      if (!requestItem) {
        throw new NotFoundException('Request item tidak ditemukan');
      }

      /* ================= APPROVE FLOW ================= */

      if (status === 'APPROVED') {
        const existingItem = await tx.spkDocumentItem.findFirst({
          where: {
            spk_document_id: requestItem.spkRequest.spk_document_id,
            kegiatan_id: requestItem.kegiatan_id,
          },
        });

        const volume = requestItem.volume; // Decimal
        const tarif = requestItem.harga_satuan; // Decimal
        const nilai = volume.mul(tarif); // Decimal-safe multiplication

        if (existingItem) {
          // 🔥 Merge volume & nilai safely
          await tx.spkDocumentItem.update({
            where: { id: existingItem.id },
            data: {
              volume: existingItem.volume.add(volume),
              nilai: existingItem.nilai.add(nilai),
            },
          });
        } else {
          // 🔥 Create new kegiatan
          await tx.spkDocumentItem.create({
            data: {
              spk_document_id: requestItem.spkRequest.spk_document_id,
              kegiatan_id: requestItem.kegiatan_id,
              mata_anggaran_id: requestItem.kegiatan.mata_anggaran_id,
              jangka_waktu: '-',
              volume: volume,
              harga_satuan: tarif,
              nilai: nilai,
            },
          });
        }
      }

      /* ================= UPDATE REQUEST ITEM ================= */

      await tx.spkRequestItem.update({
        where: { id: itemId },
        data: {
          status,
        },
      });
      /* 🔥 ADD THIS RIGHT HERE */
      if (status === 'APPROVED') {
        await this.rebuildSpkTotal(tx, requestItem.spkRequest.spk_document_id);

        await this.rebuildSpkKegiatan(
          tx,
          requestItem.spkRequest.spk_document_id,
        );
      }
      /* ================= UPDATE REQUEST HEADER ================= */

      await tx.spkRequest.update({
        where: { id: requestItem.spk_request_id },
        data: {
          approved_at: new Date(),
          approved_by: approvedBy,
        },
      });

      return { success: true };
    });
  }

  async finalizeSpk(spkId: number, adminName: string) {
    return this.prisma.$transaction(async (tx) => {
      const spk = await tx.spkDocument.findUnique({
        where: { id: spkId },
      });

      if (!spk) {
        throw new NotFoundException('SPK tidak ditemukan');
      }

      if (spk.status === 'APPROVED') {
        throw new BadRequestException('SPK sudah difinalisasi');
      }

      // 🔥 Get items FROM spk_document_item (NOT request)
      const items = await tx.spkDocumentItem.findMany({
        where: { spk_document_id: spkId },
        include: { kegiatan: true },
      });

      if (items.length === 0) {
        throw new BadRequestException(
          'Tidak ada kegiatan yang dapat difinalisasi',
        );
      }

      const total = items.reduce((sum, item) => sum + Number(item.nilai), 0);

      const nomorData = await this.generateApprovedSpkNumber(tx, spk.tahun);

      const alokasi = await tx.alokasiMitra.create({
        data: {
          tahun: spk.tahun,
          bulan: spk.bulan,
          mitra_id: spk.mitra_id,
          spk_document_id: spkId,
          total_nilai: total,
          nomor_urut: nomorData.nomor_urut,
          nomor_spk: nomorData.nomor_spk,
          status: 'APPROVED',
        },
      });

      // 🔥 Move items to alokasi detail
      for (const item of items) {
        await tx.alokasiMitraDetail.create({
          data: {
            alokasi_mitra_id: alokasi.id,
            spk_document_id: spkId,
            mitra_id: spk.mitra_id,
            kegiatan_id: item.kegiatan_id,
            mata_anggaran_id: item.mata_anggaran_id,
            nilai: item.nilai,
          },
        });
      }

      await tx.spkDocument.update({
        where: { id: spkId },
        data: {
          status: 'APPROVED',
          approved_at: new Date(),
          approved_by: adminName,
          total_honorarium: total,
        },
      });

      return { message: 'SPK berhasil difinalisasi' };
    });
  }

  async getRequestItemsBySpk(spkId: number) {
    return this.prisma.spkRequestItem.findMany({
      where: {
        spkRequest: {
          spk_document_id: spkId,
        },
      },
      include: {
        kegiatan: {
          select: {
            nama_kegiatan: true,
            satuan: true,
          },
        },
        spkRequest: {
          select: {
            id: true,
            status: true,
            created_at: true,
            created_by_user_id: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async deleteSpk(spkId: number) {
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id: spkId },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    if (spk.status === 'APPROVED') {
      throw new BadRequestException(
        'SPK yang sudah APPROVED tidak dapat dihapus',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      /* =========================================
       DELETE REQUEST ITEMS
    ========================================= */
      await tx.spkRequestItem.deleteMany({
        where: {
          spkRequest: {
            is: {
              spk_document_id: spkId,
            },
          },
        },
      });

      /* =========================================
       DELETE REQUESTS
    ========================================= */
      await tx.spkRequest.deleteMany({
        where: {
          spk_document_id: spkId,
        },
      });

      /* =========================================
       DELETE DOCUMENT ITEMS
    ========================================= */
      await tx.spkDocumentItem.deleteMany({
        where: {
          spk_document_id: spkId,
        },
      });

      /* =========================================
   DELETE ALOKASI DETAIL
========================================= */

      const alokasi = await tx.alokasiMitra.findUnique({
        where: { spk_document_id: spkId },
      });

      if (alokasi) {
        await tx.alokasiMitraDetail.deleteMany({
          where: {
            alokasi_mitra_id: alokasi.id,
          },
        });

        await tx.alokasiMitra.delete({
          where: { id: alokasi.id },
        });
      }

      /* =========================================
       DELETE ALOKASI
    ========================================= */
      await tx.alokasiMitra.deleteMany({
        where: {
          spk_document_id: spkId,
        },
      });

      /* =========================================
       DELETE MASTER SPK
    ========================================= */
      await tx.spkDocument.delete({
        where: { id: spkId },
      });

      return { message: 'SPK dan seluruh datanya berhasil dihapus' };
    });
  }

  async updateSpkItem(itemId: number, volume: number) {
    const item = await this.prisma.spkDocumentItem.findUnique({
      where: { id: itemId },
      include: { kegiatan: true },
    });

    if (!item) {
      throw new NotFoundException('Item tidak ditemukan');
    }

    const tarif = item.kegiatan.tarif_per_satuan ?? 0;
    const newNilai = volume * tarif;

    return this.prisma.$transaction(async (tx) => {
      await tx.spkDocumentItem.update({
        where: { id: itemId },
        data: {
          volume,
          nilai: newNilai,
        },
      });

      const total = await tx.spkDocumentItem.aggregate({
        where: { spk_document_id: item.spk_document_id },
        _sum: { nilai: true },
      });

      await tx.spkDocument.update({
        where: { id: item.spk_document_id },
        data: {
          total_honorarium: Number(total._sum.nilai ?? 0),
        },
      });
    });
  }

  async deleteSpkItemByAdmin(itemId: number) {
    const item = await this.prisma.spkDocumentItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item tidak ditemukan');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.spkDocumentItem.delete({
        where: { id: itemId },
      });

      const total = await tx.spkDocumentItem.aggregate({
        where: { spk_document_id: item.spk_document_id },
        _sum: { nilai: true },
      });

      await tx.spkDocument.update({
        where: { id: item.spk_document_id },
        data: {
          total_honorarium: Number(total._sum.nilai ?? 0),
        },
      });
    });
  }

  async getAlokasiById(id: number) {
    const alokasi = await this.prisma.alokasiMitra.findUnique({
      where: { id },
    });

    if (!alokasi) {
      throw new NotFoundException('Alokasi tidak ditemukan');
    }

    return alokasi;
  }
  async cancelSpkByAdmin(spkId: number) {
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id: spkId },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    if (spk.status === 'APPROVED') {
      throw new BadRequestException(
        'SPK yang sudah APPROVED tidak dapat dibatalkan oleh admin',
      );
    }

    return this.prisma.spkDocument.update({
      where: { id: spkId },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  async getApprovedSpkForKetua(
    userId: number,
    role: string,
    tahun?: number,
    bulan?: number,
  ) {
    const whereClause: any = {
      status: 'APPROVED',
    };

    if (tahun) {
      whereClause.tahun = Number(tahun);
    }

    if (bulan) {
      whereClause.bulan = Number(bulan);
    }

    return this.prisma.spkDocument.findMany({
      where: whereClause,
      include: {
        mitra: true,
        penilaianMitra: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
  async getKetuaSummary(userId: string) {
    const totalSpk = await this.prisma.spkDocument.count({
      where: { created_by_user_id: userId },
    });

    const approved = await this.prisma.spkDocument.count({
      where: {
        created_by_user_id: userId,
        status: 'APPROVED',
      },
    });

    const pending = await this.prisma.spkDocument.count({
      where: {
        created_by_user_id: userId,
        status: 'PENDING',
      },
    });

    const recentActivities = await this.prisma.spkDocument.findMany({
      where: { created_by_user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        nomor_spk: true,
        status: true,
        created_at: true,
      },
    });

    return {
      totalSpk,
      approved,
      pending,
      recentActivities, // always exists
    };
  }

  async getSpkPreviewForKetua(spkId: number, userId: string) {
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

    /* =========================================
     ACCESS CHECK
  ========================================= */

    const hasAccess = await this.prisma.spkRequest.findFirst({
      where: {
        spk_document_id: spkId,
        created_by_user_id: userId,
      },
    });

    if (!hasAccess) {
      throw new NotFoundException(
        'SPK tidak ditemukan atau tidak memiliki akses',
      );
    }

    /* =========================================
     DEFINE SAFE TYPE (NO ANY)
  ========================================= */

    type ItemType =
      | Prisma.SpkRequestItemGetPayload<{ include: { kegiatan: true } }>
      | Prisma.SpkDocumentItemGetPayload<{ include: { kegiatan: true } }>;

    let items: ItemType[] = [];

    /* =========================================
     IF PENDING → SHOW REQUEST ITEMS
  ========================================= */

    if (spk.status === 'PENDING') {
      items = await this.prisma.spkRequestItem.findMany({
        where: {
          spkRequest: {
            is: {
              spk_document_id: spkId,
              created_by_user_id: userId,
            },
          },
        },
        include: {
          kegiatan: true,
        },
        orderBy: { id: 'asc' },
      });
    } else {
      /* =========================================
       IF APPROVED / OTHER → SHOW OFFICIAL ITEMS
    ========================================= */

      items = await this.prisma.spkDocumentItem.findMany({
        where: { spk_document_id: spkId },
        include: {
          kegiatan: true,
        },
        orderBy: { id: 'asc' },
      });
    }

    /* =========================================
     CALCULATE TOTAL
  ========================================= */

    const total = items.reduce(
      (sum: number, item) => sum + Number(item.nilai ?? 0),
      0,
    );

    /* =========================================
     RETURN STANDARDIZED STRUCTURE
  ========================================= */

    return {
      id: spk.id,
      nomor_spk: spk.nomor_spk,
      tahun: spk.tahun,
      bulan: spk.bulan,
      status: spk.status,
      spk_kegiatan: spk.spk_kegiatan,
      tanggal_mulai: spk.tanggal_mulai,
      tanggal_selesai: spk.tanggal_selesai,
      admin_note: spk.admin_note,

      mitra: {
        id: spk.mitra.id,
        nama_mitra: spk.mitra.nama_mitra,
        alamat: spk.mitra.alamat ?? '-',
      },

      kegiatan: items.map((i) => ({
        id: i.id,
        nama_kegiatan: i.kegiatan.nama_kegiatan,
        volume: Number(i.volume),
        harga_satuan: Number(i.harga_satuan),
        nilai: Number(i.nilai),
        status: 'status' in i ? i.status : undefined,
      })),

      total_honorarium: total,
    };
  }

  async getMonthlyAbsorption(tahun: number) {
    const result = await this.prisma.alokasiMitra.groupBy({
      by: ['bulan'],
      where: {
        tahun,
        status: 'APPROVED',
      },
      _sum: {
        total_nilai: true,
      },
      orderBy: {
        bulan: 'asc',
      },
    });

    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const formatted = months.map((month) => {
      const found = result.find((r) => r.bulan === month);

      return {
        bulan: month,
        total: Number(found?._sum.total_nilai ?? 0),
      };
    });

    return formatted;
  }

  async updateSpkPeriod(
    id: number,
    body: { tanggal_mulai: string; tanggal_selesai: string },
  ) {
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    const tanggalMulai = new Date(`${body.tanggal_mulai}T12:00:00`);
    const tanggalSelesai = new Date(`${body.tanggal_selesai}T12:00:00`);

    if (tanggalSelesai < tanggalMulai) {
      throw new BadRequestException(
        'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
      );
    }

    const jangkaWaktu = this.formatTanggalRange(tanggalMulai, tanggalSelesai);

    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ update master
      await tx.spkDocument.update({
        where: { id },
        data: {
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalSelesai,
        },
      });

      // 2️⃣ update semua item
      await tx.spkDocumentItem.updateMany({
        where: { spk_document_id: id },
        data: {
          jangka_waktu: jangkaWaktu,
        },
      });
    });
  }
}
