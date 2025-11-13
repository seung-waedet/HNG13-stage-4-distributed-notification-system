import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import * as dotenv from 'dotenv';

dotenv.config();

const logger = new Logger("Bootstrap");

async function bootstrap() {
  // Create hybrid application (HTTP + Microservice)
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Connect RabbitMQ microservice
  const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
  logger.log(`🔌 Connecting to RabbitMQ at: ${rabbitmqUrl}`);
  logger.log(`📬 Queue: push.queue`);
  logger.log(`🔄 Exchange: notifications.direct (direct)`);
  logger.log(`🎯 Listening for pattern: "push"`);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'push.queue',
      queueOptions: {
        durable: true,
      },
      noAck: false,
      prefetchCount: 1,
      exchange: 'notifications.direct',
      exchangeType: 'direct',
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
      // Robust deserializer: unwrap Nest envelopes and safely extract data
      deserializer: {
        deserialize: (value: any) => {
          try {
            const contentStr = value?.content?.toString?.() ?? '';
            if (contentStr) {
              const parsed = JSON.parse(contentStr);
              // If message is a Nest envelope, honor its pattern
              if (parsed && typeof parsed === 'object' && 'pattern' in parsed && 'data' in parsed) {
                return { pattern: parsed.pattern, data: parsed.data };
              }
              // Otherwise, treat parsed payload as data and infer pattern from routingKey
              const routingKey = value?.fields?.routingKey || 'push';
              return { pattern: routingKey, data: parsed };
            }
            // No content string; fallback to default pattern
            return { pattern: 'push', data: value };
          } catch (err) {
            // Fallback: deliver raw payload under default pattern
            return { pattern: 'push', data: value };
          }
        },
      },
    },
  });

  await app.startAllMicroservices();
  logger.log("✅ RabbitMQ microservice started and listening for messages on push.queue");

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 Push Service HTTP server running on port ${port}`);
  logger.log(`💡 Ready to process push notifications!`);
}
bootstrap();
