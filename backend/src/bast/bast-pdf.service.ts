import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BastPdfService {
  async generatePdf(
    templateName: string,
    data: Record<string, any>,
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
      html = html.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value ?? '');
    }

    const browser = await puppeteer.launch({
      headless: true,
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
