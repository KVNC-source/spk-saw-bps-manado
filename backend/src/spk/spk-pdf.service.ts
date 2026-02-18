import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import * as path from 'path';

import { renderHtml } from './utils/render-html';
import { renderLampiranRows } from './utils/render-lampiran';

export interface SpkPdfSnapshot {
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

  lampiran_rows: {
    no: number;
    uraian_tugas: string;
    jangka_waktu: string;
    volume: number;
    satuan: string;
    harga_satuan: number;
    nilai: number;
    beban_anggaran: string;
  }[];

  is_bast?: boolean;
}

@Injectable()
export class SpkPdfService {
  async generateSpkPdf(data: SpkPdfSnapshot): Promise<Buffer> {
    try {
      if (!data) {
        throw new Error('SPK snapshot data not found');
      }

      const templatePath = path.join(
        process.cwd(),
        'src',
        'spk',
        'templates',
        'spk.html',
      );

      const templateSource = readFileSync(templatePath, 'utf-8');

      const lampiranRowsHtml = renderLampiranRows(data.lampiran_rows);

      const html = renderHtml(templateSource, {
        ...data,
        lampiran_table_rows: lampiranRowsHtml,
      });

      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfUint8 = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      await browser.close();

      return Buffer.from(pdfUint8);
    } catch (error) {
      console.error('🔥 SPK PDF GENERATION ERROR');
      console.error(error);

      throw new InternalServerErrorException('SPK PDF generation failed');
    }
  }
}
