import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
export declare class RateLimitInterceptor extends ThrottlerGuard {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
