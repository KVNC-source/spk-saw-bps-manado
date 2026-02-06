import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MitraService } from './mitra.service';

@Controller('spk/mitra')
export class MitraController {
  constructor(private readonly mitraService: MitraService) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getDashboard(@Req() req) {
    return this.mitraService.getDashboardSummary(req.user.mitra_id);
  }

  // ✅ NEW ENDPOINT
  @UseGuards(JwtAuthGuard)
  @Get('alokasi')
  getMyAlokasi(@Req() req) {
    return this.mitraService.getMyAlokasi(req.user.mitra_id);
  }
}
