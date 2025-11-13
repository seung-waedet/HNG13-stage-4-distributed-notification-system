import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HttpHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async checkHealth() {
    return this.health.check([
      async () => this.http.pingCheck('api-gateway', process.env.API_GATEWAY_URL || 'http://localhost:3000'),
      async () => this.http.pingCheck('user-service', process.env.USER_SERVICE_URL || 'http://localhost:8081'),
      async () => this.http.pingCheck('template-service', process.env.TEMPLATE_SERVICE_URL || 'http://localhost:8082'),
    ]);
  }
}
