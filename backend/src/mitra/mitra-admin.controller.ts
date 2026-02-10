import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MitraService } from './mitra.service';

@Controller('admin/mitra')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MitraAdminController {
  constructor(private readonly mitraService: MitraService) {}

  /* =========================
   * READ ALL MITRA
   * ========================= */
  @Get()
  findAllMitra() {
    return this.mitraService.findAll();
  }

  /* =========================
   * READ ONE MITRA
   * ========================= */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mitraService.findById(id);
  }

  /* =========================
   * CREATE MITRA
   * ========================= */
  @Post()
  create(@Body() data: { nama_mitra: string; alamat?: string }) {
    if (!data.nama_mitra) {
      throw new BadRequestException('Nama mitra wajib diisi');
    }
    return this.mitraService.create(data);
  }

  /* =========================
   * UPDATE MITRA
   * ========================= */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      nama_mitra?: string;
      alamat?: string;
      no_hp?: string;
      bank?: string;
      no_rekening?: string;
    },
  ) {
    return this.mitraService.update(id, data);
  }

  /* =========================
   * DELETE MITRA
   * ========================= */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mitraService.remove(id);
  }
}
