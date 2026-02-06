import { Module } from '@nestjs/common';
import { MitraService } from './mitra.service';
import { MitraController } from './mitra.controller';
import { MitraAdminController } from './mitra.admin.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    MitraController, // MITRA panel (/spk/mitra/*)
    MitraAdminController, // ADMIN panel (/admin/mitra)
  ],
  providers: [MitraService],
})
export class MitraModule {}
