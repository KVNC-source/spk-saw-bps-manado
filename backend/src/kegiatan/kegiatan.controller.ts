import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KegiatanService } from './kegiatan.service';

@Controller('kegiatan')
@UseGuards(JwtAuthGuard)
export class KegiatanController {
  constructor(private readonly kegiatanService: KegiatanService) {}

  @Get()
  getAll() {
    return this.kegiatanService.findAll();
  }
}
