import { IsInt, IsPositive } from 'class-validator';

export class CreateAlokasiDto {
  @IsInt()
  tahun!: number;

  @IsInt()
  bulan!: number;

  @IsInt()
  mitra_id!: number;

  @IsInt()
  kegiatan_id!: number;

  @IsPositive()
  volume!: number;

  @IsPositive()
  tarif!: number;
}
