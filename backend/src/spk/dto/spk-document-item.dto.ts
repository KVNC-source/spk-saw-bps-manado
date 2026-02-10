import { IsNumber, IsString } from 'class-validator';

export class SpkDocumentItemDto {
  @IsNumber()
  kegiatan_id!: number;

  @IsString()
  jangka_waktu!: string;

  @IsNumber()
  volume!: number;

  @IsNumber()
  harga_satuan!: number;
}
