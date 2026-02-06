import { IsDateString, IsInt } from 'class-validator';

export class CreateBastDto {
  @IsInt()
  spkDocumentId: number;

  @IsDateString()
  tanggal: string;
}
