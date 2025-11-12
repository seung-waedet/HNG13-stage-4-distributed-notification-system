import { ClientProxy } from '@nestjs/microservices';
import { NotificationRequestDto } from './dto/create-notification.dto';
import { ApiResponse } from '../../../shared-contracts/types/response.types';
import { RabbitMQPublisherService } from '../rabbitmq/publisher.service';
export declare class NotificationsService {
    private readonly client;
    private readonly publisher;
    private readonly logger;
    constructor(client: ClientProxy, publisher: RabbitMQPublisherService);
    processNotification(dto: NotificationRequestDto): Promise<ApiResponse>;
}
