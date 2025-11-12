import { IsString, IsEmail, IsOptional, IsObject, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  push_token?: string;

  @IsOptional()
  @IsObject()
  preferences?: any;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  push_token?: string;

  @IsOptional()
  @IsObject()
  preferences?: any;
}

export class UpdateUserPreferencesDto {
  @IsObject()
  preferences: any;
}
