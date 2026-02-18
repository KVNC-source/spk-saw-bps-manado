import { IsInt, Min, Max } from 'class-validator';

export class CreatePenilaianDto {
  @IsInt()
  spkDocumentId!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  ketepatan_waktu!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  kualitas!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  komunikasi!: number;
}
