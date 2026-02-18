import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SawService } from './saw.service';
import { CalculateSawDto } from './dto/calculate-saw.dto';
import { CreatePenilaianDto } from './dto/create-penilaian.dto';

@Controller('spk/saw')
export class SawController {
  constructor(private readonly sawService: SawService) {}

  @Post('calculate')
  async calculate(@Body() dto: CalculateSawDto) {
    return this.sawService.calculate(dto);
  }

  @Post('penilaian')
  async savePenilaian(@Body() dto: CreatePenilaianDto): Promise<{
    id: number;
    spk_document_id: number;
    mitra_id: number;
    ketepatan_waktu: number;
    kualitas: number;
    komunikasi: number;
  }> {
    return this.sawService.savePenilaian(dto);
  }

  @Get('performance')
  async calculatePerformance(
    @Query('tahun', ParseIntPipe) tahun: number,
    @Query('bulan', ParseIntPipe) bulan: number,
  ): Promise<{
    tahun: number;
    bulan: number;
    metode: string;
    totalAlternatif: number;
    hasil: any[];
  }> {
    return this.sawService.calculatePerformanceSaw(tahun, bulan);
  }
}
