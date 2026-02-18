import { Module } from '@nestjs/common';
import { SawService } from './saw.service';
import { SawController } from './saw.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // ✅ ONLY THIS
  providers: [SawService],
  controllers: [SawController],
})
export class SawModule {}
