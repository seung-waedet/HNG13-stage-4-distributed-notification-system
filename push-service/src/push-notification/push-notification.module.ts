import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
// Note: Removed ClientsModule; using direct publisher for status updates
import { PushNotificationProcessor } from "./push-notification.processor";
import { PushNotificationService } from "./push-notification.service";
import { UserService } from "./user.service";
import { PushClientProvider } from "./push-client.provider";
import { RetryService } from "./retry.service";
import { StatusUpdateService } from "./status-update.service";
import { CircuitBreakerService } from "./circuit-breaker.service";
import { StatusPublisherService } from "./status-publisher.service";

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [PushNotificationProcessor],
  providers: [
    PushNotificationService,
    UserService,
    PushClientProvider,
    RetryService,
    StatusUpdateService,
    CircuitBreakerService,
    StatusPublisherService,
  ],
})
export class PushNotificationModule {}
