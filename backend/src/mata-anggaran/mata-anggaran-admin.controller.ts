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
import { MataAnggaranService } from './mata-anggaran.service';

@Controller('admin/mata-anggaran')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MataAnggaranAdminController {
  constructor(private readonly service: MataAnggaranService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(
    @Body()
    data: {
      kode_anggaran: string;
      nama_anggaran: string;
      tahun: number;
      is_active: boolean;
    },
  ) {
    if (!data.kode_anggaran || !data.nama_anggaran || !data.tahun) {
      throw new BadRequestException('Data mata anggaran tidak lengkap');
    }

    return this.service.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      kode_anggaran?: string;
      nama_anggaran?: string;
      tahun?: number;
      is_active?: boolean;
    },
  ) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
