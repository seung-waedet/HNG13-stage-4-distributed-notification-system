import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationRequestDto } from './dto/create-notification.dto';
import { ApiResponse as ApiSwaggerResponse } from '@nestjs/swagger';
import { ApiResponse } from '../../../shared-contracts/types/response.types';

@Controller('api/v1')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('notifications')
  @HttpCode(HttpStatus.OK)
  @ApiSwaggerResponse({
    status: 200,
    description: 'Notification queued successfully',
    schema: {
      example: {
        success: true,
        data: {
          notification_id: 'req-123e4567-e89b-12d3-a456-426614174000',
          status: 'queued'
        },
        message: 'Notification queued successfully'
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createNotification(
    @Body() createNotificationDto: NotificationRequestDto
  ): Promise<ApiResponse> {
    return this.notificationsService.processNotification(createNotificationDto);
  }
}
