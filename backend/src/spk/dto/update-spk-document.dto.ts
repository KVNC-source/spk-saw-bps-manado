import { IsOptional, IsString } from 'class-validator';

export class UpdateSpkDocumentDto {
  @IsOptional()
  @IsString()
  tanggal_perjanjian?: string;

  @IsOptional()
  @IsString()
  tanggal_pembayaran?: string;
}
