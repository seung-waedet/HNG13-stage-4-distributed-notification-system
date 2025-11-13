import { Injectable, Logger } from '@nestjs/common';
import { connect, ChannelWrapper, AmqpConnectionManager } from 'amqp-connection-manager';
import { ConfirmChannel, Options } from 'amqplib';

@Injectable()
export class RabbitMQPublisherService {
  private readonly logger = new Logger(RabbitMQPublisherService.name);
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;

  private readonly url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  private readonly exchange = 'notifications.direct';

  constructor() {
    this.connection = connect([this.url]);

    this.connection.on('connect', () => this.logger.log('✅ RabbitMQ publisher connected'));
    this.connection.on('disconnect', (err) => this.logger.error(`❌ RabbitMQ publisher disconnected: ${err?.err?.message || err}`));

    this.channel = this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(this.exchange, 'direct', { durable: true });
        this.logger.log(`📡 Publisher using exchange: ${this.exchange} (direct)`);
      },
    });
  }

  async publish(routingKey: string, payload: any): Promise<void> {
    const content = Buffer.from(JSON.stringify(payload));
    const options: Options.Publish = {
      contentType: 'application/json',
      // deliveryMode 2 marks messages as persistent
      deliveryMode: 2,
    };

    try {
      await this.channel.publish(this.exchange, routingKey, content, options);
      this.logger.log(`📤 Published message to exchange "${this.exchange}" with key "${routingKey}"`);
    } catch (error) {
      this.logger.error(`❌ Failed to publish message: ${error.message}`, error.stack);
      throw error;
    }
  }
}