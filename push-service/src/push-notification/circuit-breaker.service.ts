import { Injectable, Logger } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuitBreakers = new Map<string, CircuitBreaker>();

  createCircuitBreaker(
    name: string,
    operation: (...args: any[]) => Promise<any>,
    options?: CircuitBreaker.Options
  ): CircuitBreaker {
    const defaultOptions: CircuitBreaker.Options = {
      timeout: 3000, // If our function takes longer than 3 seconds, trigger failure
      errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
      resetTimeout: 30000, // After 30 seconds, try again
    };

    const circuitBreaker = new CircuitBreaker(operation, { ...defaultOptions, ...options });

    circuitBreaker.on('open', () => {
      this.logger.warn(`Circuit breaker ${name} opened`);
    });

    circuitBreaker.on('close', () => {
      this.logger.log(`Circuit breaker ${name} closed`);
    });

    circuitBreaker.on('halfOpen', () => {
      this.logger.log(`Circuit breaker ${name} half-opened`);
    });

    this.circuitBreakers.set(name, circuitBreaker);
    return circuitBreaker;
  }

  getCircuitBreaker(name: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(name);
  }
}
