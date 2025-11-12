import { Injectable, Logger, Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { PushNotificationService } from './push-notification.service';
import { StatusUpdateService } from './status-update.service';

@Controller()
export class PushNotificationProcessor {
  private readonly logger = new Logger(PushNotificationProcessor.name);

  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly statusUpdateService: StatusUpdateService,
  ) {}

  @EventPattern('push')
  async handlePushNotification(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey;

    if (routingKey !== 'push') {
      this.logger.warn(
        `🚦 Received message with routing key "${routingKey}" - ignoring.`,
      );
      channel.ack(originalMsg);
      return;
    }
    
    this.logger.log('═══════════════════════════════════════');
    this.logger.log('📬 RECEIVED PUSH NOTIFICATION EVENT');
    this.logger.log('═══════════════════════════════════════');
    this.logger.log(`📦 Raw message: ${originalMsg.content.toString()}`);
    this.logger.log(`🏷️  Routing key: ${originalMsg.fields.routingKey}`);
    this.logger.log(`📋 Properties: ${JSON.stringify(originalMsg.properties)}`);
    this.logger.log(`📦 Parsed data: ${JSON.stringify(data)}`);
    this.logger.log(`🔍 Notification ID: ${data?.notification_id}`);
    this.logger.log('═══════════════════════════════════════');

    try {
      // Process the push notification
      this.logger.log(`⚙️ Processing push notification: ${data.notification_id}`);
      const result = await this.pushNotificationService.sendPushNotification(data);
      this.logger.log(`✅ Push notification sent successfully: ${JSON.stringify(result)}`);

      // Update status to delivered
      await this.statusUpdateService.updateStatus({
        notification_id: data.notification_id,
        status: 'delivered',
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`✅ Successfully delivered notification: ${data.notification_id}`);
      
      // Manually acknowledge the message
      channel.ack(originalMsg);
      this.logger.log(`✅ Message acknowledged`);
      
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to deliver notification: ${data.notification_id}`, error?.stack);

      // Update status to failed
      await this.statusUpdateService.updateStatus({
        notification_id: data.notification_id,
        status: 'failed',
        timestamp: new Date().toISOString(),
        error: error?.message,
      });

      // Decide whether to requeue based on error characteristics
      const msg = (error?.message || '').toLowerCase();
      const transientHints = ['econnrefused','enotfound','etimedout','econnreset','timeout','503','502','500'];
      const is4xx = /status\s+4\d{2}/.test(msg);
      const userOptOut = msg.includes('user has disabled push notifications');
      const shouldRequeue = transientHints.some(h => msg.includes(h)) && !userOptOut && !is4xx;

      if (shouldRequeue) {
        channel.nack(originalMsg, false, true);
        this.logger.warn(`⚠️ Message rejected and requeued for retry`);
      } else {
        channel.ack(originalMsg);
        this.logger.warn(`⚠️ Message acknowledged without requeue due to non-retriable error`);
      }
    }
  }
}
