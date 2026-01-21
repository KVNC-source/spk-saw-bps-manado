import { IsInt, Min, Max, IsPositive } from 'class-validator';

export class CalculateSawDto {
  @IsInt()
  tahun: number;

  @IsInt()
  @Min(1)
  @Max(12)
  bulan: number;

  // ✅ MASTER ROLE (selected by admin)
  @IsInt()
  @IsPositive()
  spkRoleId: number;
}
