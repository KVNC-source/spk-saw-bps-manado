import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { SpkPdfService } from './spk-pdf.service';
import { SpkService } from './spk.service';
import { SpkApprovalService } from './approval/spk-approval.service';
import { CreateManualSpkDto } from './dto/create-manual-spk.dto';
import { Request } from 'express';
import type { AuthRequest } from '../auth/auth-request.interface';

@Controller('spk')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpkController {
  constructor(
    private readonly spkPdfService: SpkPdfService,
    private readonly spkService: SpkService,
    private readonly spkApprovalService: SpkApprovalService,
  ) {}

  @Get('dashboard-summary')
  getDashboardSummary(@Req() req) {
    if (req.user.role === 'ADMIN') {
      return this.spkService.getAdminDashboardSummary();
    }

    return this.spkService.getDashboardSummaryByUser(req.user.id);
  }
  /* =====================================================
   * DASHBOARD — ADMIN
   * ===================================================== */
  @Roles('ADMIN')
  @Get('admin/dashboard-summary')
  getAdminDashboardSummary() {
    return this.spkService.getAdminDashboardSummary();
  }

  /* =====================================================
   * DASHBOARD — KETUA TIM
   * ===================================================== */
  @Roles('KETUA_TIM')
  @Get('ketua/dashboard-summary')
  getKetuaDashboard(@Req() req) {
    return this.spkService.getDashboardSummaryByUser(req.user.id);
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
   * SPK LIST (KETUA TIM)
   * ===================================================== */
  @Roles('KETUA_TIM')
  @Get('mine')
  getMySpk(@Req() req) {
    return this.spkService.getSpkByUser(req.user.id);
  }

  /* =====================================================
   * CREATE SPK — ADMIN (MANUAL)
   * ===================================================== */
  @Roles('ADMIN')
  @Post('manual')
  createManualSpk(@Body() body: CreateManualSpkDto, @Req() req: AuthRequest) {
    return this.spkService.createManualSpk(body, req.user.id);
  }

  /* =====================================================
   * SPK DETAIL (ADMIN OR OWNER)
   * ===================================================== */
  @Get(':id')
  async getSpkById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.spkService.getSpkByIdWithAccessCheck(
      id,
      req.user.id,
      req.user.role,
    );
  }

  /* =====================================================
   * PDF (READ ONLY)
   * ===================================================== */
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

  /* =====================================================
   * ADD ITEM (ADMIN)
   * ===================================================== */
  @Roles('ADMIN')
  @Post(':id/items')
  addItemToSpk(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { kegiatan_id: number; volume: number },
    @Req() req,
  ) {
    return this.spkService.addSpkItem(id, req.user.role, body, req.user.id);
  }

  /* =====================================================
   * REMOVE ITEM (ADMIN)
   * ===================================================== */
  @Roles('ADMIN')
  @Delete('items/:itemId')
  removeItemFromSpk(@Param('itemId', ParseIntPipe) itemId: number, @Req() req) {
    return this.spkService.deleteSpkItem(itemId, req.user.role, req.user.id);
  }
}
