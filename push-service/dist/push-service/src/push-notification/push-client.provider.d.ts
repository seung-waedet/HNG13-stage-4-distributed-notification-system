export declare class PushClientProvider {
    private readonly logger;
    private fcmInitialized;
    private fcm;
    constructor();
    sendPush(deviceToken: string, content: string, metadata?: any): Promise<any>;
}
