import { Module } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { KegiatanController } from './kegiatan.controller';
import { KegiatanAdminController } from './kegiatan-admin.controller';

@Module({
  controllers: [
    KegiatanController, // /kegiatan
    KegiatanAdminController, // /admin/kegiatan
  ],
  providers: [KegiatanService],
})
export class KegiatanModule {}
