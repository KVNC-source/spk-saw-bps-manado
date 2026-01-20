import { Module } from '@nestjs/common';
import { MitraService } from './mitra.service';
import { MitraController } from './mitra.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MitraController],
  providers: [MitraService, PrismaService],
})
export class MitraModule {}
