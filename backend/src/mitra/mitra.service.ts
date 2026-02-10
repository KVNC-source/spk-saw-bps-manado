import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MitraService {
  constructor(private prisma: PrismaService) {}

  // =====================
  // DASHBOARD SUMMARY (MITRA)
  // =====================
  async getDashboardSummary(mitraId: number) {
    const totalAlokasi = await this.prisma.alokasiMitra.count({
      where: { mitra_id: mitraId },
    });

    const alokasiDraft = await this.prisma.alokasiMitra.count({
      where: {
        mitra_id: mitraId,
        status: 'PENDING',
      },
    });

    const alokasiApproved = await this.prisma.alokasiMitra.count({
      where: {
        mitra_id: mitraId,
        status: 'APPROVED',
      },
    });

    const kegiatanUsed = await this.prisma.spkDocumentItem.findMany({
      where: {
        spkDocument: {
          mitra_id: mitraId,
        },
      },
      select: {
        kegiatan_id: true,
      },
    });

    const uniqueKegiatanCount = new Set(kegiatanUsed.map((k) => k.kegiatan_id))
      .size;

    return {
      totalAlokasi,
      alokasiDraft,
      alokasiApproved,
      alokasiUsed: uniqueKegiatanCount,
    };
  }

  // =====================
  // PEKERJAAN SAYA (MITRA)
  // =====================
  async getMyAlokasi(mitraId: number) {
    return this.prisma.spkDocumentItem.findMany({
      where: {
        spkDocument: {
          mitra_id: mitraId,
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

  // =====================
  // DATA MITRA (ADMIN)
  // =====================
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
    await this.findById(id); // ensures existence

    return this.prisma.mitra.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findById(id); // ensures existence

    /**
     * 🔒 SAFETY RULE (RECOMMENDED)
     * Prevent deleting mitra already used in SPK
     */
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
