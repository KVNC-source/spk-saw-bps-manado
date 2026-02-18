import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface BastTemplateData {
  bastNomor: string;
  spkNomor: string; // ✅ ADD THIS
  tanggalText: string;

  nama_pejabat_bps: string;
  nip_pejabat_bps?: string;
  alamat_bps: string;

  nama_mitra: string;
  alamat_mitra: string;
  spk_role: string;
}

@Injectable()
export class BastPdfService {
  async generatePdf(
    templateName: string,
    data: BastTemplateData,
  ): Promise<Buffer> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'bast',
      'templates',
      `${templateName}.html`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new InternalServerErrorException(
        `Template BAST tidak ditemukan: ${templatePath}`,
      );
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    for (const [key, value] of Object.entries(data)) {
      html = html.replace(
        new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
        String(value ?? ''),
      );
    }

    const browser = await puppeteer.launch({
      headless: true, // ✅ FIX
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      return Buffer.from(pdf);
    } catch {
      throw new InternalServerErrorException('Gagal generate PDF BAST');
    } finally {
      await browser.close();
    }
  }
}
