import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
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

  @IsString()
  tanggal_mulai!: string;

  @IsString()
  tanggal_selesai!: string;

  @IsOptional()
  @IsString()
  tanggal_perjanjian?: string;

  @IsOptional()
  @IsString()
  tanggal_pembayaran?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KegiatanItemDto)
  kegiatan!: KegiatanItemDto[];
}
