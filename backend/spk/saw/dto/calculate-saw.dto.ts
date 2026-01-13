import { IsUUID } from 'class-validator';

export class CalculateSawDto {
  @IsUUID()
  periodeId: string;
}
