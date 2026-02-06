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
  tahun: number;

  @IsInt()
  @Min(1)
  @Max(12)
  bulan: number;

  @IsInt()
  spkRoleId: number;

  // ✅ kegiatan scope (explicit)
  @IsArray()
  @ArrayNotEmpty()
  kegiatanIds: number[];

  // ✅ Pasal 3 — DETERMINED, NOT DERIVED
  @IsDateString()
  tanggalMulai: string;

  @IsDateString()
  tanggalSelesai: string;
}
