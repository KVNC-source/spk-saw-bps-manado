import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { SpkService } from './spk.service';
import { CreateManualSpkDto } from './dto/create-manual-spk.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('ketua/spk')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('KETUA_TIM')
export class SpkKetuaController {
  constructor(private readonly spkService: SpkService) {}

  /* ===============================
   * CREATE SPK
   * =============================== */
  @Post()
  create(@Body() dto: CreateManualSpkDto, @Req() req: any) {
    return this.spkService.createManualSpk(dto, req.user.id);
  }

  /* ===============================
   * DASHBOARD SUMMARY
   * =============================== */
  @Get('summary')
  getSummary(@Req() req: any) {
    return this.spkService.getDashboardSummaryByUser(req.user.id);
  }

  /* ===============================
   * MITRA LIST
   * =============================== */
  @Get('mitra-list')
  getMitraList() {
    return this.spkService.getAllMitra();
  }

  /* ===============================
   * KEGIATAN LIST
   * =============================== */
  @Get('kegiatan-list')
  getKegiatanList() {
    return this.spkService.getAllKegiatan();
  }

  /* ===============================
   * LIST MY SPK
   * =============================== */
  @Get()
  findMySpk(@Req() req: any) {
    return this.spkService.getSpkByUser(req.user.id);
  }

  /* ===============================
   * DETAIL
   * =============================== */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.spkService.getSpkByIdWithAccessCheck(
      id,
      req.user.id,
      'KETUA_TIM',
    );
  }

  /* ===============================
   * ADD ITEM
   * =============================== */
  @Post(':id/items')
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { kegiatan_id: number; volume: number },
    @Req() req: any,
  ) {
    return this.spkService.addSpkItem(id, 'KETUA_TIM', body, req.user.id);
  }

  /* ===============================
   * DELETE ITEM
   * =============================== */
  @Delete('items/:itemId')
  deleteItem(@Param('itemId', ParseIntPipe) itemId: number, @Req() req: any) {
    return this.spkService.deleteSpkItem(itemId, 'KETUA_TIM', req.user.id);
  }

  /* ===============================
   * UPDATE LEGAL DATES
   * =============================== */
  @Patch(':id/dates')
  updateDates(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      tanggal_perjanjian?: string;
      tanggal_pembayaran?: string;
    },
  ) {
    return this.spkService.updateLegalDates(id, body);
  }

  /* ===============================
   * CANCEL (SOFT DELETE)
   * =============================== */
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.spkService.cancelSpk(id, req.user.id);
  }
}
