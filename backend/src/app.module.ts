import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SawModule } from './spk/saw/saw.module';
import { MitraModule } from './mitra/mitra.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // 👇 THIS LINE IS THE FIX
    ConfigModule.forRoot({
      isGlobal: true, // makes process.env available everywhere
    }),

    PrismaModule,
    MitraModule,
    SawModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
