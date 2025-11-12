import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';

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
    NotificationsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
