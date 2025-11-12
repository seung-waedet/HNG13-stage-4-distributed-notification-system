import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID, IsString, IsObject, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum NotificationType {
  email = 'email',
  push = 'push',
}

export class UserData {
  @ApiProperty({ example: 'John Doe', description: 'User name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://example.com', description: 'Link for the notification' })
  @IsString()
  link: string;

  @ApiProperty({
    example: { custom_field: 'custom_value' },
    description: 'Additional metadata',
    required: false
  })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

export class NotificationRequestDto {
  @ApiProperty({
    enum: NotificationType,
    description: 'Type of notification to send'
  })
  @IsEnum(NotificationType)
  notification_type: NotificationType;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID in UUID format'
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    example: 'welcome_email',
    description: 'Template code to use for the notification'
  })
  @IsString()
  template_code: string;

  @ApiProperty({
    description: 'Variables to populate in the template'
  })
  @ValidateNested()
  @Type(() => UserData)
  variables: UserData;

  @ApiProperty({
    example: 'req-123e4567-e89b-12d3-a456-426614174000',
    description: 'Request ID for idempotency'
  })
  @IsString()
  request_id: string;

  @ApiProperty({
    example: 1,
    description: 'Priority level (1-5)',
    required: false,
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({
    example: { title: 'Welcome!' },
    description: 'Additional metadata for the notification',
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
