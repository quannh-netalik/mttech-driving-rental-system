import { join } from 'node:path';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthModule } from '@/modules/auth';
import { DatabaseModule } from '@/modules/database';
import { DatabaseHealthCheckProvider, HealthModule, RedisHealthCheckProvider } from '@/modules/health';
import { LoggingModule } from '@/modules/logging';
import { RedisModule } from '@/modules/redis';

import * as configs from './config';
import { getCorrelationId } from './middleware';

@Module({
	imports: [
		ConfigModule.forRoot({
			cache: true,
			isGlobal: true,
			load: Object.values(configs),
			envFilePath: join(__dirname, '..', '.env'),
		}),
		LoggingModule.forPino({
			pinoHttp: {
				autoLogging: true,
				transport: { target: 'pino-pretty' },
				serializers: {
					req: (req: Request) => ({
						id: req.id,
						ip: req.ip,
						hostname: req.hostname,
						method: req.method,
						url: req.url,
						query: req.query,
						params: req.params,
						correlationId: getCorrelationId(req),
						['user-agent']: req.headers?.['user-agent'],
					}),
					res: (res: Response) => ({
						statusCode: res.statusCode,
					}),
				},
			},
			exclude: ['/metrics', '/health', '/.well-known'],
		}),
		RedisModule,
		DatabaseModule,
		HealthModule.forRoot([DatabaseHealthCheckProvider, RedisHealthCheckProvider]),
		AuthModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {
	protected logger = new Logger(AppModule.name);

	onApplicationShutdown(signal: string) {
		this.logger.warn(`Received signal ${signal}, shutting down`);
	}
}
