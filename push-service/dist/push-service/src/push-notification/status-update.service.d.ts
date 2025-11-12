import { StatusPublisherService } from "./status-publisher.service";
export declare class StatusUpdateService {
    private readonly statusPublisher;
    constructor(statusPublisher: StatusPublisherService);
    updateStatus(payload: {
        notification_id: string;
        status: string;
        timestamp: string;
        error?: string;
    }): Promise<void>;
}
