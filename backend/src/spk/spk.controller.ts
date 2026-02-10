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
  Req,
} from '@nestjs/common';
import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';

import { SpkPdfService } from './spk-pdf.service';
import { SpkService } from './spk.service';
import { SpkApprovalService } from './approval/spk-approval.service';

@Controller('spk')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpkController {
  constructor(
    private readonly spkPdfService: SpkPdfService,
    private readonly spkService: SpkService,
    private readonly spkApprovalService: SpkApprovalService,
  ) {}

  /* =====================================================
   * DASHBOARD SUMMARY — AUTO ROLE
   * ===================================================== */
  @Get('dashboard-summary')
  getDashboardSummary(@Req() req) {
    if (req.user.role === 'ADMIN') {
      return this.spkService.getAdminDashboardSummary();
    }

    return this.spkService.getDashboardSummaryByMitra(req.user.mitra_id);
  }

  /* =====================================================
   * DASHBOARD SUMMARY — ADMIN
   * ===================================================== */
  @Roles('ADMIN')
  @Get('admin/dashboard-summary')
  getAdminDashboardSummary() {
    return this.spkService.getAdminDashboardSummary();
  }

  /* =====================================================
   * DASHBOARD SUMMARY — MITRA
   * ===================================================== */
  @Roles('MITRA')
  @Get('mitra/dashboard-summary')
  getMitraDashboardSummary(@Req() req) {
    return this.spkService.getDashboardSummaryByMitra(req.user.mitra_id);
  }

  /* =====================================================
   * SPK LIST (ADMIN)
   * ===================================================== */
  @Roles('ADMIN')
  @Get()
  getAllSpk() {
    return this.spkService.getAllSpk();
  }

  /* =====================================================
   * CREATE SPK — MANUAL INPUT (ADMIN)
   * ===================================================== */
  @Roles('ADMIN')
  @Post('manual')
  createManualSpk(
    @Body()
    body: {
      mitra_id: number;
      tanggal_mulai: string;
      tanggal_selesai: string;
      tanggal_perjanjian?: string;
      tanggal_pembayaran?: string;
      kegiatan: {
        kegiatan_id: number;
        volume: number;
      }[];
    },
  ) {
    return this.spkService.createManualSpk(body);
  }

  /* =====================================================
   * GET APPROVED ALOKASI
   * ===================================================== */
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

  /* =====================================================
   * SPK DETAIL
   * ===================================================== */
  @Get(':id')
  getSpkById(@Param('id', ParseIntPipe) id: number) {
    return this.spkService.getSpkById(id);
  }

  /* =====================================================
   * PDF ENDPOINT (PUBLIC)
   * ===================================================== */
  @Public()
  @Get(':id/pdf')
  async generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.spkPdfService.generateSpkPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="SPK-${id}.pdf"`);

    res.end(pdfBuffer);
  }

  /* =====================================================
   * UPDATE LEGAL TEXT (ADMIN)
   * - tanggal_perjanjian
   * - tanggal_pembayaran
   * ===================================================== */
  @Roles('ADMIN')
  @Patch(':id')
  updateLegalDates(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      tanggal_perjanjian?: string;
      tanggal_pembayaran?: string;
    },
  ) {
    return this.spkService.updateLegalDates(id, body);
  }

  /* =====================================================
   * APPROVE SPK (ADMIN)
   * ===================================================== */
  @Roles('ADMIN')
  @Patch(':id/approve')
  approveSpk(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.spkApprovalService.approve(id, req.user.name);
  }
}
