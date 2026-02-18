import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MitraModule } from '../mitra/mitra.module'; // ✅ ADD THIS

import { SpkController } from './spk.controller';
import { SpkService } from './spk.service';
import { SpkPdfService } from './spk-pdf.service';

import { SpkApprovalController } from './approval/spk-approval.controller';
import { SpkApprovalService } from './approval/spk-approval.service';
import { SpkKetuaController } from './spk-ketua.controller';
import { SawModule } from './saw/saw.module'; //
@Module({
  imports: [
    PrismaModule, // ✅ better than injecting PrismaService manually
    MitraModule, // ✅ REQUIRED for MitraService injection
    SawModule,
  ],
  controllers: [SpkController, SpkApprovalController, SpkKetuaController],
  providers: [SpkService, SpkPdfService, SpkApprovalService],
})
export class SpkModule {}
