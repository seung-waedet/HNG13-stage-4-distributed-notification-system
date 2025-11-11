import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationRequestDto } from './dto/create-notification.dto';
import { ApiResponse } from '../../../shared-contracts/types/response.types';

@Injectable()
export class NotificationsService {
  constructor(@Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy) {}

  async processNotification(dto: NotificationRequestDto): Promise<ApiResponse> {
    try {
      // Prepare message for RabbitMQ
      const message = {
        notification_id: dto.request_id,
        user_id: dto.user_id,
        notification_type: dto.notification_type,
        template_code: dto.template_code,
        variables: dto.variables,
        request_id: dto.request_id,
        priority: dto.priority || 1,
        created_at: new Date().toISOString(),
        retry_count: 0,
        metadata: dto.metadata || {},
      };

      // Determine exchange routing key based on notification type
      const routingKey = dto.notification_type; // 'email' or 'push'

      // Publish to RabbitMQ
      await this.client.emit(routingKey, message).toPromise();

      return {
        success: true,
        data: { notification_id: dto.request_id, status: 'queued' },
        message: 'Notification queued successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to process notification',
      };
    }
  }
}
