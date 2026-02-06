import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

import { SpkPdfService } from './spk-pdf.service';
import { SpkService } from './spk.service';
import { CreateAlokasiDto } from './dto/create-alokasi.dto';
import { GenerateSpkDto } from './dto/generate-spk.dto';

@Controller('spk')
@UseGuards(JwtAuthGuard)
export class SpkController {
  constructor(
    private readonly spkPdfService: SpkPdfService,
    private readonly spkService: SpkService,
  ) {}

  /* ===============================
   * DASHBOARD SUMMARY
   * =============================== */
  @Get('dashboard-summary')
  getDashboardSummary() {
    return this.spkService.getDashboardSummary();
  }

  /* ===============================
   * SPK LIST (ADMIN)
   * =============================== */
  @Get()
  getAllSpk() {
    return this.spkService.getAllSpk();
  }

  /* ===============================
   * CREATE SPK — MANUAL INPUT
   * POST /spk/manual
   * =============================== */
  @Post('manual')
  createManualSpk(
    @Body()
    body: {
      mitra_id: number;
      tanggal_mulai: string;
      tanggal_selesai: string;
      kegiatan: {
        kegiatan_id: number;
        volume: number;
      }[];
    },
  ) {
    return this.spkService.createManualSpk(body);
  }

  /* ===============================
   * GENERATE SPK — FROM APPROVED ALOKASI (SAW)
   * POST /spk/generate
   * =============================== */
  @Post('generate')
  generateSpk(@Body() dto: GenerateSpkDto) {
    return this.spkService.generateSpk(dto);
  }

  /* ===============================
   * GET APPROVED ALOKASI (FOR GENERATION)
   * =============================== */
  @Get('alokasi-approved')
  getApprovedAlokasi(
    @Query('tahun') tahun?: string,
    @Query('bulan') bulan?: string,
  ) {
    return this.spkService.getApprovedAlokasi(
      tahun ? Number(tahun) : undefined,
      bulan ? Number(bulan) : undefined,
    );
  }

  /* ===============================
   * CREATE ALOKASI (DRAFT)
   * =============================== */
  @Post('alokasi')
  createAlokasi(@Body() dto: CreateAlokasiDto) {
    return this.spkService.createAlokasi(dto);
  }

  /* ===============================
   * APPROVE ALOKASI
   * =============================== */
  @Patch('alokasi/:id/approve')
  approveAlokasi(@Param('id', ParseIntPipe) id: number) {
    return this.spkService.approveAlokasi(id);
  }

  /* ===============================
   * SPK DETAIL (DB ONLY)
   * =============================== */
  @Get(':id')
  getSpkById(@Param('id', ParseIntPipe) id: number) {
    return this.spkService.getSpkById(id);
  }

  /* ===============================
   * PDF ENDPOINT (PUBLIC)
   * =============================== */
  @Get(':id/pdf')
  @Public()
  async generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.spkPdfService.generateSpkPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="SPK-${id}.pdf"`);

    res.end(pdfBuffer);
  }
}
