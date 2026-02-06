import { IsNumber, IsOptional } from 'class-validator';

export class GenerateSpkDto {
  @IsOptional()
  @IsNumber()
  tahun?: number;

  @IsOptional()
  @IsNumber()
  bulan?: number;
}
