import { Controller, Get, Param } from '@nestjs/common';
import { MitraService } from './mitra.service';

@Controller('mitra')
export class MitraController {
  constructor(private readonly mitraService: MitraService) {}

  @Get()
  findAll() {
    return this.mitraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mitraService.findOne(Number(id));
  }
}
