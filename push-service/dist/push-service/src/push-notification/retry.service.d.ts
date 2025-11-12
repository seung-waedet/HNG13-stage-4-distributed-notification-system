export declare class RetryService {
    private readonly logger;
    executeWithRetry(operation: () => Promise<any>, maxRetries?: number, baseDelay?: number, onError?: (error: Error, retryCount: number) => void): Promise<any>;
}
