import { Module } from '@nestjs/common';
import { SpkService } from './spk.service';
import { SpkPdfService } from './spk-pdf.service';
import { SpkController } from './spk.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SpkController],
  providers: [SpkService, SpkPdfService, PrismaService],
  exports: [SpkService],
})
export class SpkModule {}
