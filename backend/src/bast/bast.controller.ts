import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { BastService } from './bast.service';

@Controller('bast')
export class BastController {
  constructor(private readonly bastService: BastService) {}

  @Get(':spkId/pdf')
  async download(
    @Param('spkId', ParseIntPipe) spkId: number,
    @Res() res: Response,
  ) {
    const pdf = await this.bastService.generatePdf(spkId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="BAST-${spkId}.pdf"`,
    });

    res.send(pdf);
  }
}
