import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { RabbitMQPublisherService } from '../rabbitmq/publisher.service';
import { UserService } from '../services/user.service';
import { TemplateService } from '../services/template.service';

@Module({
  imports: [
    HttpModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'notifications_queue',
          queueOptions: {
            durable: true,
          },
          persistent: true,
          noAck: false,
          exchange: 'notifications.direct',
          exchangeType: 'direct',
          socketOptions: {
            heartbeatIntervalInSeconds: 60,
            reconnectTimeInSeconds: 5,
          },
          // Custom serializer: send only the data without pattern wrapper
          serializer: {
            serialize: (value) => Buffer.from(JSON.stringify(value.data)),
          },
        },
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    RabbitMQPublisherService,
    UserService,
    TemplateService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
