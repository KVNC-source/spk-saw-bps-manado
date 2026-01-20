import { Module } from '@nestjs/common';
import { SpkService } from './spk.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [SpkService, PrismaService],
  exports: [SpkService], // 👈 makes SpkService usable elsewhere
})
export class SpkModule {}
