import { Module } from '@nestjs/common';
import { MataAnggaranService } from './mata-anggaran.service';
import { MataAnggaranAdminController } from './mata-anggaran-admin.controller';

@Module({
  controllers: [MataAnggaranAdminController],
  providers: [MataAnggaranService],
})
export class MataAnggaranModule {}
