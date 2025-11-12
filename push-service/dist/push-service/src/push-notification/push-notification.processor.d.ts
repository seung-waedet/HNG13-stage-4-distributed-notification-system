import { RmqContext } from '@nestjs/microservices';
import { PushNotificationService } from './push-notification.service';
import { StatusUpdateService } from './status-update.service';
export declare class PushNotificationProcessor {
    private readonly pushNotificationService;
    private readonly statusUpdateService;
    private readonly logger;
    constructor(pushNotificationService: PushNotificationService, statusUpdateService: StatusUpdateService);
    handlePushNotification(data: any, context: RmqContext): Promise<any>;
}
