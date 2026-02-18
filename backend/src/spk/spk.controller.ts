/* eslint-disable @typescript-eslint/no-unsafe-return */

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
  Query,
} from '@nestjs/common';
import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

import { SpkPdfService } from './spk-pdf.service';
import { SpkService } from './spk.service';
import type { AuthRequest } from '../auth/auth-request.interface';
import { CreateManualSpkDto } from './dto/create-manual-spk.dto';

@Controller('spk')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpkController {
  constructor(
    private readonly spkPdfService: SpkPdfService,
    private readonly spkService: SpkService,
  ) {}

  /* =====================================================
   * DASHBOARD (ADMIN)
   * ===================================================== */

  @Roles(Role.ADMIN)
  @Get('dashboard-summary')
  getAdminDashboard() {
    return this.spkService.getAdminDashboardSummary();
  }

  /* =====================================================
   * SPK CRUD (ADMIN)
   * ===================================================== */

  @Roles(Role.ADMIN)
  @Post('manual')
  createManualSpk(@Body() body: CreateManualSpkDto, @Req() req: AuthRequest) {
    return this.spkService.createManualSpk(body, req.user.id);
  }

  @Roles(Role.ADMIN)
  @Get()
  getAllSpk() {
    return this.spkService.getAllSpk();
  }

  /* =====================================================
   * KETUA ACCESS (READ ONLY)
   * ===================================================== */

  @Roles(Role.ADMIN, Role.KETUA_TIM)
  @Get('approved')
  getApprovedSpkForKetua(
    @Query('tahun') tahun: number,
    @Query('bulan') bulan: number,
    @Req() req: AuthRequest,
  ) {
    return this.spkService.getApprovedSpkForKetua(
      Number(req.user.id),
      req.user.role,
      tahun,
      bulan,
    );
  }

  /* =====================================================
   * KETUA MANAGEMENT (ADMIN ONLY)
   * ===================================================== */

  @Roles(Role.ADMIN)
  @Get('ketua')
  getAllKetua() {
    return this.spkService.getAllKetua();
  }

  @Roles(Role.ADMIN)
  @Get('ketua/:id')
  getKetuaById(@Param('id') id: string) {
    return this.spkService.getKetuaById(id);
  }

  @Roles(Role.ADMIN)
  @Post('ketua')
  createKetua(
    @Body()
    body: {
      username: string;
      name: string;
      email?: string;
      password: string;
      mitra_id?: number;
    },
  ) {
    return this.spkService.createKetua(body);
  }

  @Roles(Role.ADMIN)
  @Patch('ketua/:id')
  updateKetua(
    @Param('id') id: string,
    @Body()
    body: {
      username?: string;
      name?: string;
      email?: string;
      mitra_id?: number;
    },
  ) {
    return this.spkService.updateKetua(id, body);
  }

  @Roles(Role.ADMIN)
  @Delete('ketua/:id')
  deleteKetua(@Param('id') id: string) {
    return this.spkService.deleteKetua(id);
  }

  /* =====================================================
   * REQUEST APPROVAL (ADMIN + KETUA)
   * ===================================================== */

  @Roles(Role.ADMIN, Role.KETUA_TIM)
  @Get(':id/request-items')
  getRequestItems(@Param('id', ParseIntPipe) id: number) {
    return this.spkService.getRequestItemsBySpk(id);
  }

  @Roles(Role.ADMIN, Role.KETUA_TIM)
  @Patch('request-item/:itemId')
  approveRequestItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
    @Req() req: AuthRequest,
  ) {
    return this.spkService.approveRequestItem(
      itemId,
      body.status,
      req.user.name,
    );
  }

  /* =====================================================
   * FINALIZATION (ADMIN ONLY)
   * ===================================================== */

  @Roles(Role.ADMIN)
  @Post(':id/finalize')
  finalizeSpk(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.spkService.finalizeSpk(id, req.user.name);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/cancel')
  cancelSpk(@Param('id', ParseIntPipe) id: number) {
    return this.spkService.cancelSpkByAdmin(id);
  }

  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  @Patch(':id/period')
  updateSpkPeriod(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      tanggal_mulai: string;
      tanggal_selesai: string;
    },
  ) {
    return this.spkService.updateSpkPeriod(id, body);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  deleteSpk(@Param('id', ParseIntPipe) id: number) {
    return this.spkService.deleteSpk(id);
  }

  /* =====================================================
   * SPK ITEMS (ADMIN)
   * ===================================================== */

  @Roles(Role.ADMIN)
  @Post(':id/items')
  addItemToSpk(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { kegiatan_id: number; volume: number },
    @Req() req: AuthRequest,
  ) {
    return this.spkService.addSpkItem(id, req.user.role, body, req.user.id);
  }

  @Roles(Role.ADMIN)
  @Patch('items/:itemId')
  updateItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: { volume: number },
  ) {
    return this.spkService.updateSpkItem(itemId, body.volume);
  }

  @Roles(Role.ADMIN)
  @Delete('items/:itemId')
  removeItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.spkService.deleteSpkItemByAdmin(itemId);
  }

  /* =====================================================
   * PDF (ADMIN + KETUA)
   * ===================================================== */

  @Roles(Role.ADMIN, Role.KETUA_TIM)
  @Get(':id/pdf')
  async generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const snapshot = await this.spkService.buildSpkPdfData(id);
    const pdfBuffer = await this.spkPdfService.generateSpkPdf(snapshot);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="SPK-${snapshot.nomor_spk ?? id}.pdf"`,
    );

    res.end(pdfBuffer);
  }

  /* =====================================================
   * DETAIL (ADMIN + KETUA)
   * ===================================================== */

  @Roles(Role.ADMIN, Role.KETUA_TIM)
  @Get(':id')
  getSpkById(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.spkService.getSpkByIdWithAccessCheck(
      id,
      req.user.id,
      req.user.role,
    );
  }

  @Get('monthly-absorption/:tahun')
  getMonthlyAbsorption(@Param('tahun') tahun: string) {
    return this.spkService.getMonthlyAbsorption(Number(tahun));
  }
}
