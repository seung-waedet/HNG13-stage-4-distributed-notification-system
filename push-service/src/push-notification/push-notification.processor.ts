import { Injectable, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PushNotificationService } from './push-notification.service';
import { StatusUpdateService } from './status-update.service';

@Injectable()
export class PushNotificationProcessor {
  private readonly logger = new Logger(PushNotificationProcessor.name);

  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly statusUpdateService: StatusUpdateService,
  ) {}

  @MessagePattern('push')
  async handlePushNotification(@Payload() data: any) {
    this.logger.log(`Processing push notification: ${data.notification_id}`);

    try {
      // Process the push notification
      const result = await this.pushNotificationService.sendPushNotification(data);

      // Update status to delivered
      await this.statusUpdateService.updateStatus({
        notification_id: data.notification_id,
        status: 'delivered',
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Successfully delivered notification: ${data.notification_id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to deliver notification: ${data.notification_id}`, error);

      // Update status to failed
      await this.statusUpdateService.updateStatus({
        notification_id: data.notification_id,
        status: 'failed',
        timestamp: new Date().toISOString(),
        error: error.message,
      });

      // Throw error to trigger RabbitMQ's retry mechanism
      throw error;
    }
  }
}
