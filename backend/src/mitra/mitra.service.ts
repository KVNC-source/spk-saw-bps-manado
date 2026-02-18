import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MitraService {
  constructor(private prisma: PrismaService) {}

  /* =====================================================
   * DASHBOARD SUMMARY (KETUA TIM)
   * ===================================================== */
  async getDashboardSummaryByUser(userId: string) {
    const [totalRequest, totalItems, approved, pending, rejected] =
      await Promise.all([
        // Total request created by Ketua
        this.prisma.spkRequest.count({
          where: { created_by_user_id: userId },
        }),

        // Total kegiatan submitted
        this.prisma.spkRequestItem.count({
          where: {
            spkRequest: {
              created_by_user_id: userId,
            },
          },
        }),

        // Approved kegiatan
        this.prisma.spkRequestItem.count({
          where: {
            status: 'APPROVED',
            spkRequest: {
              created_by_user_id: userId,
            },
          },
        }),

        // Pending kegiatan
        this.prisma.spkRequestItem.count({
          where: {
            status: 'PENDING',
            spkRequest: {
              created_by_user_id: userId,
            },
          },
        }),

        // Rejected kegiatan
        this.prisma.spkRequestItem.count({
          where: {
            status: 'REJECTED',
            spkRequest: {
              created_by_user_id: userId,
            },
          },
        }),
      ]);

    return {
      totalRequest,
      totalKegiatan: totalItems,
      approved,
      pending,
      rejected,
    };
  }

  /* =====================================================
   * PEKERJAAN SAYA (ALOKASI FINAL)
   * ===================================================== */
  async getMyAlokasiByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { mitra_id: true },
    });

    if (!user?.mitra_id) {
      return [];
    }

    return this.prisma.spkDocumentItem.findMany({
      where: {
        spkDocument: {
          mitra_id: user.mitra_id,
          status: 'APPROVED',
        },
      },
      include: {
        kegiatan: {
          select: {
            nama_kegiatan: true,
            satuan: true,
          },
        },
        spkDocument: {
          select: {
            nomor_spk: true,
            status: true,
            tahun: true,
            bulan: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  /* =====================================================
   * MITRA LIST
   * ===================================================== */
  async findAll() {
    return this.prisma.mitra.findMany({
      orderBy: {
        nama_mitra: 'asc',
      },
    });
  }

  async findById(id: number) {
    const mitra = await this.prisma.mitra.findUnique({
      where: { id },
    });

    if (!mitra) {
      throw new NotFoundException('Mitra tidak ditemukan');
    }

    return mitra;
  }

  async create(data: {
    nama_mitra: string;
    alamat?: string;
    no_hp?: string;
    nik?: string;
    bank?: string;
    no_rekening?: string;
  }) {
    if (!data.nama_mitra) {
      throw new BadRequestException('Nama mitra wajib diisi');
    }

    return this.prisma.mitra.create({
      data,
    });
  }

  async update(
    id: number,
    data: {
      nama_mitra?: string;
      alamat?: string;
      no_hp?: string;
      bank?: string;
      no_rekening?: string;
    },
  ) {
    await this.findById(id);

    return this.prisma.mitra.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findById(id);

    const used = await this.prisma.spkDocument.count({
      where: { mitra_id: id },
    });

    if (used > 0) {
      throw new BadRequestException(
        'Mitra sudah digunakan dalam SPK dan tidak dapat dihapus',
      );
    }

    return this.prisma.mitra.delete({
      where: { id },
    });
  }

  /* =====================================================
   * KEGIATAN LIST
   * ===================================================== */
  async getAllKegiatan() {
    return this.prisma.kegiatan.findMany({
      orderBy: {
        nama_kegiatan: 'asc',
      },
    });
  }

  /* =====================================================
   * MY REQUEST ITEMS (KETUA VIEW)
   * ===================================================== */
  async getMyRequestItems(userId: string) {
    return this.prisma.spkRequestItem.findMany({
      where: {
        spkRequest: {
          created_by_user_id: userId,
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
            spkDocument: {
              select: {
                id: true,
                nomor_spk: true,
                tahun: true,
                bulan: true,
                mitra: {
                  select: {
                    nama_mitra: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }
}
