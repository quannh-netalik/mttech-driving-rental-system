import { Provider } from '@nestjs/common';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';

import { RedisHealthIndicator } from './indicators';

const timeout = 5000;

export const DatabaseHealthCheckProvider: Provider = {
	provide: Symbol.for('Health.Database'),

	useFactory: (db: TypeOrmHealthIndicator) => {
		return () => db.pingCheck('database', { timeout });
	},

	inject: [TypeOrmHealthIndicator],
};

export const RedisHealthCheckProvider: Provider = {
	provide: Symbol.for('Health.Redis'),

	useFactory: (redis: RedisHealthIndicator) => {
		return () => redis.isHealthy('redis', { timeout });
	},

	inject: [RedisHealthIndicator],
};
