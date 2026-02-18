import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MinLength,
  IsInt,
} from 'class-validator';

export class CreateKetuaDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsInt()
  mitra_id?: number;
}
