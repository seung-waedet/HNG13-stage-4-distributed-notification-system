import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PushNotificationModule } from './push-notification/push-notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'push.queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.USER_SERVICE_PORT) || 8081,
        },
      },
      {
        name: 'TEMPLATE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.TEMPLATE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.TEMPLATE_SERVICE_PORT) || 8082,
        },
      },
    ]),
    PushNotificationModule,
  ],
})
export class AppModule {}
