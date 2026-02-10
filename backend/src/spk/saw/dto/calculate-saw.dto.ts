import {
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayNotEmpty,
  IsDateString,
} from 'class-validator';

export class CalculateSawDto {
  @IsInt()
  tahun!: number;

  @IsInt()
  @Min(1)
  @Max(12)
  bulan!: number;

  @IsInt()
  spkRoleId!: number;

  // kegiatan scope
  @IsArray()
  @ArrayNotEmpty()
  kegiatanIds!: number[];

  // dates
  @IsDateString()
  tanggalMulai!: string;

  @IsDateString()
  tanggalSelesai!: string;
}
