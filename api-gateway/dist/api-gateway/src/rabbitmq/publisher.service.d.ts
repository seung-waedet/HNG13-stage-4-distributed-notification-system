export declare class RabbitMQPublisherService {
    private readonly logger;
    private connection;
    private channel;
    private readonly url;
    private readonly exchange;
    constructor();
    publish(routingKey: string, payload: any): Promise<void>;
}
