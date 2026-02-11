import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MitraService {
  constructor(private prisma: PrismaService) {}

  /**
   * =====================
   * DASHBOARD SUMMARY (KETUA TIM)
   * =====================
   */
  async getDashboardSummaryByUser(userId: string) {
    const totalSpk = await this.prisma.spkDocument.count({
      where: { created_by_user_id: userId },
    });

    const spkPending = await this.prisma.spkDocument.count({
      where: {
        created_by_user_id: userId,
        status: 'PENDING',
      },
    });

    const spkApproved = await this.prisma.spkDocument.count({
      where: {
        created_by_user_id: userId,
        status: 'APPROVED',
      },
    });

    const kegiatanUsed = await this.prisma.spkDocumentItem.findMany({
      where: {
        spkDocument: {
          created_by_user_id: userId,
        },
      },
      select: {
        kegiatan_id: true,
      },
    });

    const uniqueKegiatanCount = new Set(kegiatanUsed.map((k) => k.kegiatan_id))
      .size;

    return {
      totalSpk,
      spkPending,
      spkApproved,
      kegiatanUsed: uniqueKegiatanCount,
    };
  }

  /**
   * =====================
   * PEKERJAAN SAYA (KETUA TIM)
   * =====================
   */
  async getMyAlokasiByUser(userId: string) {
    return this.prisma.spkDocumentItem.findMany({
      where: {
        spkDocument: {
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
        spkDocument: {
          select: {
            nomor_spk: true,
            status: true,
            tahun: true,
            bulan: true,
            mitra_id: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  /**
   * =====================
   * DATA MITRA (ADMIN)
   * =====================
   */
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

    // 🔒 Prevent deleting mitra already used in SPK
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
}
