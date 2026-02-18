import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { BastService } from './bast.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('bast')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // 🔥 Only ADMIN can access BAST
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
