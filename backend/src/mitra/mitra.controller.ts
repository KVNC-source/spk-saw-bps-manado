import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MitraService } from './mitra.service';

@Controller('spk/mitra')
@UseGuards(JwtAuthGuard)
export class MitraController {
  constructor(private readonly mitraService: MitraService) {}

  /**
   * =====================
   * DASHBOARD (KETUA TIM)
   * =====================
   */
  @Get('dashboard')
  getDashboard(@Req() req) {
    return this.mitraService.getDashboardSummaryByUser(req.user.id);
  }

  /**
   * =====================
   * PEKERJAAN SAYA / ALOKASI
   * =====================
   */
  @Get('alokasi')
  getMyAlokasi(@Req() req) {
    return this.mitraService.getMyAlokasiByUser(req.user.id);
  }
}
