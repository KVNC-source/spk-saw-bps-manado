import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BastController } from './bast.controller';
import { BastService } from './bast.service';
import { BastPdfService } from './bast-pdf.service';

@Module({
  imports: [PrismaModule],
  controllers: [BastController],
  providers: [BastService, BastPdfService],
})
export class BastModule {}
