import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { PushNotificationProcessor } from "./push-notification.processor";
import { PushNotificationService } from "./push-notification.service";
import { UserService } from "./user.service";
import { TemplateService } from "./template.service";
import { PushClientProvider } from "./push-client.provider";
import { RetryService } from "./retry.service";
import { StatusUpdateService } from "./status-update.service";
import { CircuitBreakerService } from "./circuit-breaker.service";

@Module({
  imports: [
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
    ]),
  ],
  providers: [
    PushNotificationProcessor,
    PushNotificationService,
    UserService,
    TemplateService,
    PushClientProvider,
    RetryService,
    StatusUpdateService,
    CircuitBreakerService,
  ],
})
export class PushNotificationModule {}
