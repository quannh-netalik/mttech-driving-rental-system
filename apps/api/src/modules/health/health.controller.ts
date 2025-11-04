import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorFunction } from '@nestjs/terminus';

import { HEALTH_CHECKS } from './health.constant';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Inject(HEALTH_CHECKS)
    private readonly checks: HealthIndicatorFunction[],
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check(this.checks);
  }
}
