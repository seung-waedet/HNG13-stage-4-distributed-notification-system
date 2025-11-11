import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { HttpModule } from "@nestjs/axios";
import { PushNotificationModule } from "./push-notification/push-notification.module";
import { HealthController } from "./health/health.controller";
import { CircuitBreakerService } from "./push-notification/circuit-breaker.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    ClientsModule.register([
      {
        name: "RABBITMQ_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || "amqp://localhost:5672"],
          queue: "push.queue",
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: "NOTIFICATION_STATUS_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || "amqp://localhost:5672"],
          queue: "notifications.direct",
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    PushNotificationModule,
  ],
  controllers: [HealthController],
  providers: [CircuitBreakerService],
})
export class AppModule {}
