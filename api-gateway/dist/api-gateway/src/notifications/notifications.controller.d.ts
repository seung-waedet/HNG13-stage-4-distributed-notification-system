import { NotificationsService } from './notifications.service';
import { NotificationRequestDto } from './dto/create-notification.dto';
import { ApiResponse } from '../../../shared-contracts/types/response.types';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    createNotification(createNotificationDto: NotificationRequestDto): Promise<ApiResponse>;
}
