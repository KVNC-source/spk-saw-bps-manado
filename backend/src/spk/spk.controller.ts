import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { SpkService } from './spk.service';
import { SpkPdfService } from './spk-pdf.service';

@Controller('spk')
export class SpkController {
  constructor(
    private readonly spkService: SpkService,
    private readonly spkPdfService: SpkPdfService,
  ) {}

  /**
   * ============================================
   * POST /spk
   * Create SPK SNAPSHOT (MANDATORY STEP)
   * ============================================
   */
  @Post()
  async createSpk(
    @Body()
    body: {
      tahun: number;
      bulan: number;
      mitraId: number;
      spkKegiatan: string;
      spkRoleId: number;
    },
  ) {
    return this.spkService.createSpk({
      tahun: body.tahun,
      bulan: body.bulan,
      mitraId: body.mitraId,
      spkKegiatan: body.spkKegiatan,
      spkRoleId: body.spkRoleId,
    });
  }

  /**
   * ============================================
   * GET /spk/:id/pdf
   * Generate PDF FROM EXISTING SPK
   * ============================================
   */
  @Get(':id/pdf')
  async generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.spkPdfService.generateSpkPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="SPK-${id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(pdfBuffer);
  }
}
