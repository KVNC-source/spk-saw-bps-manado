import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BastPdfService } from './bast-pdf.service';
import { formatTanggalIndonesia } from './utils/date';

@Injectable()
export class BastService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: BastPdfService,
  ) {}

  async generatePdf(spkId: number): Promise<Buffer> {
    const spk = await this.prisma.spkDocument.findUnique({
      where: { id: spkId },
    });

    if (!spk) {
      throw new NotFoundException('SPK tidak ditemukan');
    }

    const mitra = await this.prisma.mitra.findUnique({
      where: { id: spk.mitra_id },
    });

    if (!mitra) {
      throw new NotFoundException('Mitra tidak ditemukan');
    }

    const renderData = {
      bastNomor: `BAST-${spk.nomor_spk}`,
      tahun: spk.tahun,
      tanggalText: formatTanggalIndonesia(new Date()),
      spkNomor: spk.nomor_spk,

      // ===== SAME DATA AS SPK =====
      nama_pejabat_bps: process.env.PPK_NAMA,
      nip_pejabat_bps: process.env.PPK_NIP,
      alamat_bps:
        'Jl. Mangga III Kelurahan Bumi Nyiur Kecamatan Wanea Kota Manado',

      nama_mitra: mitra.nama_mitra,
      alamat_mitra: mitra.alamat,
      spk_role: spk.spk_role,
    };

    return this.pdfService.generatePdf('bast', renderData);
  }
}
