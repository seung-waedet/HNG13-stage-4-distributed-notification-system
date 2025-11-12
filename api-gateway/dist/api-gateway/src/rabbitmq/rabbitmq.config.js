"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRabbitMQ = setupRabbitMQ;
const common_1 = require("@nestjs/common");
const amqp = require("amqplib");
const logger = new common_1.Logger('RabbitMQConfig');
async function setupRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
        const channel = await connection.createChannel();
        const exchange = 'notifications.direct';
        await channel.assertExchange(exchange, 'direct', { durable: true });
        logger.log(`Exchange "${exchange}" created/verified`);
        const queues = ['email.queue', 'push.queue', 'failed.queue'];
        for (const queue of queues) {
            await channel.assertQueue(queue, { durable: true });
            logger.log(`Queue "${queue}" created/verified`);
        }
        await channel.bindQueue('email.queue', exchange, 'email');
        await channel.bindQueue('push.queue', exchange, 'push');
        logger.log(`Queue bindings created`);
        await channel.close();
        await connection.close();
        logger.log(`RabbitMQ setup completed successfully`);
    }
    catch (error) {
        logger.error(`❌ Failed to setup RabbitMQ: ${error.message}`, error.stack);
        throw error;
    }
}
//# sourceMappingURL=rabbitmq.config.js.map