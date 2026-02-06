import { IsNotEmpty, IsString } from 'class-validator';

export class RejectSpkDto {
  @IsString()
  @IsNotEmpty()
  admin_note!: string;
}
