import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateKetuaDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  mitra_id?: number;
}
