import { Module } from '@nestjs/common';
import { SpkApprovalController } from './spk-approval.controller';
import { SpkApprovalService } from './spk-approval.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SpkApprovalController],
  providers: [SpkApprovalService],
})
export class SpkApprovalModule {}
