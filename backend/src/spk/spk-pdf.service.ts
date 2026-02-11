import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { SpkService } from './spk.service';
import { readFileSync } from 'fs';
import * as path from 'path';

import { renderHtml } from './utils/render-html';
import { renderLampiranRows } from './utils/render-lampiran';

@Injectable()
export class SpkPdfService {
  constructor(private readonly spkService: SpkService) {}

  async generateSpkPdf(spkId: number): Promise<Buffer> {
    try {
      /* ===============================
       * 1️⃣ BUILD SNAPSHOT DATA
       * =============================== */
      const data = await this.spkService.buildSpkPdfData(spkId);

      if (!data) {
        throw new Error('SPK snapshot data not found');
      }

      /* ===============================
       * 2️⃣ LOAD HTML TEMPLATE
       * =============================== */
      const templatePath = path.join(
        process.cwd(),
        'src',
        'spk',
        'templates',
        'spk.html',
      );

      const templateSource = readFileSync(templatePath, 'utf-8');

      /* ===============================
       * 3️⃣ BUILD LAMPIRAN ROWS
       * =============================== */
      const lampiranRowsHtml = renderLampiranRows(data.lampiran_rows);

      /* ===============================
       * 4️⃣ MERGE DATA INTO TEMPLATE
       * =============================== */
      const html = renderHtml(templateSource, {
        ...data,
        lampiran_table_rows: lampiranRowsHtml,
      });

      /* ===============================
       * 5️⃣ RENDER PDF
       * =============================== */
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
