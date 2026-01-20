import { Controller, Post, Body } from '@nestjs/common';
import { SawService } from './saw.service';
import { CalculateSawDto } from './dto/calculate-saw.dto';
import { SawResultDto } from './dto/saw-result.dto';

@Controller('spk/saw')
export class SawController {
  constructor(private readonly sawService: SawService) {}

  @Post('calculate')
  async calculate(@Body() dto: CalculateSawDto): Promise<SawResultDto> {
    return this.sawService.calculate(dto);
  }
}
