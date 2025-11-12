import * as CircuitBreaker from 'opossum';
export declare class CircuitBreakerService {
    private readonly logger;
    private circuitBreakers;
    createCircuitBreaker(name: string, operation: (...args: any[]) => Promise<any>, options?: CircuitBreaker.Options): CircuitBreaker;
    getCircuitBreaker(name: string): CircuitBreaker | undefined;
}
