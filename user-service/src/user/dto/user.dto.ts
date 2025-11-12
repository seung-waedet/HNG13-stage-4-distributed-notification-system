import { IsString, IsEmail, IsOptional, IsObject, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'The email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'fcm_token_string_example', description: 'Firebase Cloud Messaging token for push notifications', required: false })
  @IsOptional()
  @IsString()
  push_token?: string;

  @ApiProperty({ example: { push: true, email: false }, description: 'User notification preferences', required: false })
  @IsOptional()
  @IsObject()
  preferences?: any;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'Jane Doe', description: 'The updated name of the user', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'jane.doe@example.com', description: 'The updated email address of the user', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'new_fcm_token_string_example', description: 'Updated FCM token for push notifications', required: false })
  @IsOptional()
  @IsString()
  push_token?: string;

  @ApiProperty({ example: { push: false, email: true }, description: 'Updated user notification preferences', required: false })
  @IsOptional()
  @IsObject()
  preferences?: any;
}

export class UpdateUserPreferencesDto {
  @ApiProperty({ example: { push: true, sms: false }, description: 'Partial update of user notification preferences' })
  @IsObject()
  preferences: any;
}
