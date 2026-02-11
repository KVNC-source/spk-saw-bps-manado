import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { SpkController } from './spk.controller';
import { SpkService } from './spk.service';
import { SpkPdfService } from './spk-pdf.service';

import { SpkApprovalController } from './approval/spk-approval.controller';
import { SpkApprovalService } from './approval/spk-approval.service';
import { SpkKetuaController } from './spk-ketua.controller';

@Module({
  controllers: [
    SpkController,
    SpkApprovalController,
    SpkKetuaController, // ✅ ADD THIS
  ],
  providers: [SpkService, SpkPdfService, SpkApprovalService, PrismaService],
})
export class SpkModule {}
