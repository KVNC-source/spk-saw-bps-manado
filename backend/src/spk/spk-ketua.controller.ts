import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  Post,
  Res,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import type { Response } from 'express';

import { SpkService } from './spk.service';
import { SpkPdfService } from './spk-pdf.service';
import { MitraService } from '../mitra/mitra.service';
import { CreateManualSpkDto } from './dto/create-manual-spk.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('ketua/spk')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.KETUA_TIM)
export class SpkKetuaController {
  constructor(
    private readonly spkService: SpkService,
    private readonly spkPdfService: SpkPdfService,
    private readonly mitraService: MitraService,
  ) {}

  /* ================= CREATE REQUEST ================= */

  @Post()
  create(
    @Body() dto: CreateManualSpkDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.spkService.createManualSpk(dto, req.user.id);
  }

  /* ================= DASHBOARD SUMMARY ================= */

  @Get('summary')
  getSummary(@Req() req: { user: { id: string } }) {
    return this.spkService.getKetuaSummary(req.user.id);
  }

  /* ================= SUPPORTING DATA ================= */

  @Get('mitra-list')
  getMitraList() {
    return this.mitraService.findAll();
  }

  @Get('kegiatan-list')
  getKegiatanList() {
    return this.mitraService.getAllKegiatan();
  }

  @Get('my-items')
  getMyRequestItems(@Req() req: { user: { id: string } }) {
    return this.mitraService.getMyRequestItems(req.user.id);
  }

  /* ================= SPK LIST ================= */

  @Get()
  findMySpk(@Req() req: { user: { id: string } }) {
    return this.spkService.getSpkByUser(req.user.id);
  }

  /* ================= CANCEL ================= */

  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: string } },
  ) {
    return this.spkService.cancelSpk(id, req.user.id);
  }

  /* ================= DOWNLOAD PDF ================= */

  @Get(':id/pdf')
  async downloadSpkPdf(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: string } },
    @Res() res: Response,
  ) {
    // Access validation
    await this.spkService.getSpkPreviewForKetua(id, req.user.id);

    const snapshot = await this.spkService.buildSpkPdfData(id);
    const pdfBuffer = await this.spkPdfService.generateSpkPdf(snapshot);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=SPK-${snapshot.nomor_spk}.pdf`,
    });

    res.send(pdfBuffer);
  }

  /* ================= DETAIL (PREVIEW) ================= */

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: string } },
  ) {
    return this.spkService.getSpkPreviewForKetua(id, req.user.id);
  }
}
