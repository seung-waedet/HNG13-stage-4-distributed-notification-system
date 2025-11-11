import { Module } from '@nestjs/common';
import { PushNotificationProcessor } from './push-notification.processor';
import { PushNotificationService } from './push-notification.service';
import { UserService } from './user.service';
import { TemplateService } from './template.service';
import { PushClientProvider } from './push-client.provider';
import { RetryService } from './retry.service';
import { StatusUpdateService } from './status-update.service';

@Module({
  providers: [
    PushNotificationProcessor,
    PushNotificationService,
    UserService,
    TemplateService,
    PushClientProvider,
    RetryService,
    StatusUpdateService,
  ],
})
export class PushNotificationModule {}
