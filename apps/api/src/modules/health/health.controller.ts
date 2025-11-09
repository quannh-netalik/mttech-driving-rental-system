import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckResult, HealthCheckService, HealthIndicatorFunction } from '@nestjs/terminus';

import { HEALTH_CHECKS } from './health.constant';

@ApiTags('Health')
@Controller('health')
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		@Inject(HEALTH_CHECKS)
		private readonly checks: HealthIndicatorFunction[],
	) {}

	@Get()
	@HealthCheck()
	@ApiOperation({ summary: 'Check application health status' })
	@ApiResponse({ status: 200, description: 'Health check passed' })
	@ApiResponse({ status: 503, description: 'Health check failed' })
	check(): Promise<HealthCheckResult> {
		return this.health.check(this.checks);
	}
}
