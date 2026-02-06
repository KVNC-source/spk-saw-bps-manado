/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { SpkApprovalService } from './spk-approval.service';
import { RejectSpkDto } from './dto/reject-spk.dto';
import { SpkDocument } from '@prisma/client';

@Controller('admin/spk')
export class SpkApprovalController {
  constructor(private readonly service: SpkApprovalService) {}

  @Get()
  findAll(): Promise<SpkDocument[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SpkDocument> {
    return this.service.findOne(id);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number): Promise<SpkDocument> {
    return this.service.approve(id, 'SYSTEM');
  }

  @Patch(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectSpkDto,
  ): Promise<SpkDocument> {
    return this.service.reject(id, dto.admin_note);
  }
}
