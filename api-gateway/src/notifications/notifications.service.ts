import { Injectable, Logger } from '@nestjs/common';
import { NotificationRequestDto } from './dto/create-notification.dto';
import { ApiResponse } from '../../../shared-contracts/types/response.types';
import { RabbitMQPublisherService } from '../rabbitmq/publisher.service';
import { UserService } from '../services/user.service';
import { TemplateService } from '../services/template.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly publisher: RabbitMQPublisherService,
    private readonly userService: UserService,
    private readonly templateService: TemplateService,
  ) {
    this.logger.log('NotificationsService initialized');
  }

  async processNotification(dto: NotificationRequestDto): Promise<ApiResponse> {
    this.logger.log(`Received notification request: ${JSON.stringify(dto)}`);

    try {
      // 1. Fetch user and template data in parallel
      const [user, template] = await Promise.all([
        this.userService.getUser(dto.user_id),
        this.templateService.getTemplate(dto.template_code),
      ]);

      // 2. Construct the detailed message payload
      const notificationId = uuidv4();
      const messageData = {
        request_id: dto.request_id,
        notification_id: notificationId,
        user: user,
        template: template,
        variables: dto.variables,
        metadata: dto.metadata || {},
      };

      // 3. Determine routing key and publish
      const routingKey = dto.notification_type; // 'email' or 'push'

      this.logger.log(`Publishing message with routing key: "${routingKey}"`);
      this.logger.log(`Message Data: ${JSON.stringify(messageData)}`);

      await this.publisher.publish(routingKey, messageData);

      this.logger.log(`Message published to exchange "notifications.direct" with key "${routingKey}"`);

      return {
        success: true,
        data: { notification_id: notificationId, status: 'queued' },
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

