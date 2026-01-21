import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { SpkService } from './spk.service';
import { readFileSync } from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';

@Injectable()
export class SpkPdfService {
  constructor(private readonly spkService: SpkService) {}

  async generateSpkPdf(spkId: number): Promise<Buffer> {
    try {
      /* ===============================
       * 1️⃣ Build snapshot data
       * =============================== */
      const data = await this.spkService.buildSpkPdfData(spkId);

      if (!data) {
        throw new Error('SPK snapshot data not found');
      }

      /* ===============================
       * 2️⃣ DEV-SAFE TEMPLATE PATH
       * =============================== */
      const templatePath = path.join(
        process.cwd(),
        'src',
        'spk',
        'spk.template.html',
      );

      console.log('Using SPK template:', templatePath);

      const templateSource = readFileSync(templatePath, 'utf-8');

      const template = Handlebars.compile(templateSource, {
        strict: false, // prevent crash if optional fields missing
      });

      const html = template(data);

      /* ===============================
       * 3️⃣ Launch Puppeteer (Windows-safe)
       * =============================== */
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: puppeteer.executablePath(),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      /* ===============================
       * 4️⃣ Generate PDF
       * =============================== */
      const pdfUint8 = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      await browser.close();

      return Buffer.from(pdfUint8);
    } catch (error: any) {
      console.error('🔥 SPK PDF GENERATION ERROR');
      console.error(error);

      throw new InternalServerErrorException(
        error?.message || 'SPK PDF generation failed',
      );
    }
  }
}
