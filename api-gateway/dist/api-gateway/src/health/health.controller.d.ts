import { HealthCheckService, MicroserviceHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private health;
    private microservice;
    constructor(health: HealthCheckService, microservice: MicroserviceHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
