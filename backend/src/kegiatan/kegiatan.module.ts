import { Module } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { KegiatanController } from './kegiatan.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [KegiatanController],
  providers: [KegiatanService, PrismaService],
})
export class KegiatanModule {}
