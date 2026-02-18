import { Module } from '@nestjs/common';
import { MitraService } from './mitra.service';
import { MitraController } from './mitra.controller';
import { MitraAdminController } from './mitra-admin.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MitraController, MitraAdminController],
  providers: [MitraService],
  exports: [MitraService], // ✅ ADD THIS LINE
})
export class MitraModule {}
