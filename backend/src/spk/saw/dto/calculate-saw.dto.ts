import { IsInt, Min, Max } from 'class-validator';

export class CalculateSawDto {
  @IsInt()
  tahun: number;

  @IsInt()
  @Min(1)
  @Max(12)
  bulan: number;
}
