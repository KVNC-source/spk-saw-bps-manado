import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SawModule } from './spk/saw/saw.module';
import { SpkModule } from './spk/spk.module';
import { MitraModule } from './mitra/mitra.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    MitraModule,
    SawModule,
    SpkModule, // 👈 THIS IS REQUIRED
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
