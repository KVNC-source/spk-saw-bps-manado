import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MitraService } from './mitra.service';

@Controller('admin/mitra')
@UseGuards(JwtAuthGuard)
export class MitraAdminController {
  constructor(private readonly mitraService: MitraService) {}

  @Get()
  findAllMitra() {
    return this.mitraService.findAll();
  }
}
