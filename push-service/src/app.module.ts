import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { TerminusModule } from "@nestjs/terminus";
import { PushNotificationModule } from "./push-notification/push-notification.module";
import { HealthController } from "./health/health.controller";
import { CircuitBreakerService } from "./push-notification/circuit-breaker.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    TerminusModule,
    PushNotificationModule,
  ],
  controllers: [HealthController],
  providers: [CircuitBreakerService],
})
export class AppModule {}
