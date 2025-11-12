import { Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

const logger = new Logger('RabbitMQConfig');

export async function setupRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    const channel = await connection.createChannel();

    // Create the exchange
    const exchange = 'notifications.direct';
    await channel.assertExchange(exchange, 'direct', { durable: true });
    logger.log(`✅ Exchange "${exchange}" created/verified`);

    // Create queues
    const queues = ['email.queue', 'push.queue', 'failed.queue'];
    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: true });
      logger.log(`✅ Queue "${queue}" created/verified`);
    }

    // Bind queues to exchange with routing keys
    await channel.bindQueue('email.queue', exchange, 'email');
    await channel.bindQueue('push.queue', exchange, 'push');
    logger.log(`✅ Queue bindings created`);

    await channel.close();
    await connection.close();
    logger.log(`✅ RabbitMQ setup completed successfully`);
  } catch (error) {
    logger.error(`❌ Failed to setup RabbitMQ: ${error.message}`, error.stack);
    throw error;
  }
}
