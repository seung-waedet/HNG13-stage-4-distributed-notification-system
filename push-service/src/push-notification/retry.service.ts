import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  async executeWithRetry(
    operation: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    onError?: (error: Error, retryCount: number) => void
  ) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 0) {
          this.logger.log(`Operation succeeded after ${attempt} retries`);
        }
        return result;
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.error(`Operation failed after ${maxRetries} retries: ${error.message}`);
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        this.logger.warn(`Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);

        if (onError) {
          onError(error, attempt + 1);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
