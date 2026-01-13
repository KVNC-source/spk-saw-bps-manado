import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MitraModule } from './mitra/mitra.module';
import { PeriodeModule } from './periode/periode.module';
import { BebanKerjaModule } from './beban-kerja/beban-kerja.module';
import { HonorModule } from './honor/honor.module';
import { DokumenModule } from './dokumen/dokumen.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { PrismaModule } from './prisma/prisma.module'; // 👈 ADD THIS
import { SawModule } from '../spk/saw/saw.module';

@Module({
  imports: [
    PrismaModule,
    SawModule,
    AuthModule,
    UsersModule,
    MitraModule,
    PeriodeModule,
    BebanKerjaModule,
    HonorModule,
    DokumenModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
