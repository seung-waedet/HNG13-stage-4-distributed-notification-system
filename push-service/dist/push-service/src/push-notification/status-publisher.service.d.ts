export declare class StatusPublisherService {
    private readonly logger;
    private connection?;
    private channel?;
    private readonly exchangeName;
    private readonly exchangeType;
    private ensureChannel;
    publishStatus(payload: any): Promise<void>;
}
