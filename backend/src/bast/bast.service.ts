import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { BastPdfService } from './bast-pdf.service';

@Injectable()
export class BastService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: BastPdfService,
  ) {}

  async generatePdf(spkId: number): Promise<Buffer> {
    /* ===============================
     * 1️⃣ FETCH SPK
     * =============================== */
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id: spkId },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    if (!spk.tanggal_pembayaran) {
      throw new BadRequestException('Tanggal pembayaran belum diisi pada SPK');
    }

    /* ===============================
     * 2️⃣ FETCH ALOKASI
     * =============================== */
    const alokasi = await this.prisma.alokasiMitra.findUnique({
      where: { spk_document_id: spkId },
    });

    if (!alokasi) {
      throw new BadRequestException(
        'BAST hanya dapat dibuat untuk SPK yang telah disetujui',
      );
    }

    /* ===============================
     * 3️⃣ FETCH MITRA
     * =============================== */
    const mitra = await this.prisma.mitra.findUnique({
      where: { id: spk.mitra_id },
    });

    if (!mitra) {
      throw new NotFoundException('Mitra tidak ditemukan');
    }

    /* ===============================
     * 4️⃣ RENDER DATA (STRING-BASED)
     * =============================== */
    const renderData = {
      bastNomor: `BAST-${alokasi.nomor_spk}`,

      // 🔥 USE STRING AS-IS
      tanggalText: spk.tanggal_pembayaran,

      nama_pejabat_bps: 'Arista Roza Belawan, SST',
      nip_pejabat_bps: process.env.PPK_NIP,
      alamat_bps:
        'Jalan Mangga III Kelurahan Bumi Nyiur Kecamatan Wanea Kota Manado',

      nama_mitra: mitra.nama_mitra,
      alamat_mitra: mitra.alamat,
      spk_role: spk.spk_role,
    };

    return this.pdfService.generatePdf('bast', renderData);
  }
}
