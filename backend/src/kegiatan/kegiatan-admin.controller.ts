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
import { KegiatanService } from './kegiatan.service';

@Controller('admin/kegiatan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class KegiatanAdminController {
  constructor(private readonly kegiatanService: KegiatanService) {}

  /* =====================
   * READ ALL (ADMIN)
   * ===================== */
  @Get()
  findAll() {
    return this.kegiatanService.findAllAdmin();
  }

  /* =====================
   * READ ONE
   * ===================== */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kegiatanService.findById(id);
  }

  /* =====================
   * CREATE
   * ===================== */
  @Post()
  create(
    @Body()
    data: {
      nama_kegiatan: string;
      jenis_kegiatan: string;
      tahun: number;
      satuan?: string;
      tarif_per_satuan: number;
      mata_anggaran_id: number;
    },
  ) {
    if (
      !data.nama_kegiatan ||
      !data.jenis_kegiatan ||
      !data.tahun ||
      !data.mata_anggaran_id
    ) {
      throw new BadRequestException('Data kegiatan tidak lengkap');
    }

    return this.kegiatanService.create(data);
  }

  /* =====================
   * UPDATE
   * ===================== */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      nama_kegiatan?: string;
      satuan?: string;
      tarif_per_satuan?: number;
      mata_anggaran_id?: number;
    },
  ) {
    return this.kegiatanService.update(id, data);
  }

  /* =====================
   * DELETE (GUARDED)
   * ===================== */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.kegiatanService.remove(id);
  }
}
