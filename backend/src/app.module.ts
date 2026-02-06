import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MitraModule } from './mitra/mitra.module';
import { SpkModule } from './spk/spk.module';
import { BastModule } from './bast/bast.module';
import { KegiatanModule } from './kegiatan/kegiatan.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MitraModule,
    SpkModule, // ✅ SPK domain (includes SAW internally)
    BastModule,
    KegiatanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
