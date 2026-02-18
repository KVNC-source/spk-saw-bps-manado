import {
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
  IsOptional, // ← ADD THIS BACK
} from 'class-validator';

import { Type } from 'class-transformer';

class KegiatanItemDto {
  @IsNumber()
  kegiatan_id!: number;

  @IsNumber()
  volume!: number;
}

export class CreateManualSpkDto {
  @IsNumber()
  mitra_id!: number;

  // ✅ REQUIRED NOW
  @IsDateString()
  tanggal_mulai!: string;

  @IsDateString()
  tanggal_selesai!: string;

  // Still optional
  @IsString()
  @IsOptional()
  tanggal_perjanjian?: string;

  @IsString()
  @IsOptional()
  tanggal_pembayaran?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KegiatanItemDto)
  kegiatan!: KegiatanItemDto[];
}
