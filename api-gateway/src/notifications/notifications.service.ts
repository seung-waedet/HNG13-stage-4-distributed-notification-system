import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationRequestDto } from './dto/create-notification.dto';
import { ApiResponse } from '../../../shared-contracts/types/response.types';
import { RabbitMQPublisherService } from '../rabbitmq/publisher.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly publisher: RabbitMQPublisherService,
  ) {
    // ClientProxy will connect automatically when first used
    this.logger.log('📡 NotificationsService initialized with RabbitMQ client');
  }

  async processNotification(dto: NotificationRequestDto): Promise<ApiResponse> {
    this.logger.log(`📨 Received notification request: ${JSON.stringify(dto)}`);
    
    try {
      // Prepare message data
      const messageData = {
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

      // Pattern based on notification type
      const pattern = dto.notification_type; // 'email' or 'push'
      
      this.logger.log(`🚀 Publishing message with routing key: "${pattern}"`);
      this.logger.log(`📦 Message Data: ${JSON.stringify(messageData)}`);

      // Publish directly to the configured direct exchange to ensure delivery
      await this.publisher.publish(pattern, messageData);
      
      this.logger.log(`✅ Message published to exchange "notifications.direct" with key "${pattern}"`);

      return {
        success: true,
        data: { notification_id: dto.request_id, status: 'queued' },
        message: 'Notification queued successfully',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to process notification: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to process notification',
      };
    }
  }
}
