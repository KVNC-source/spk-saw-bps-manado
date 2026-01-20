import { Module } from '@nestjs/common';
import { SawService } from './saw.service';
import { SawController } from './saw.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { SpkModule } from '../spk.module';

@Module({
  imports: [
    PrismaModule,
    SpkModule, // 👈 THIS IS THE FIX
  ],
  providers: [SawService],
  controllers: [SawController],
})
export class SawModule {}
