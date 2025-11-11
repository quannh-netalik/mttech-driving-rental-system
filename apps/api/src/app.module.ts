import { join } from 'node:path';
import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/modules/auth';
import { DatabaseModule } from '@/modules/database';
import { DatabaseHealthCheckProvider, HealthModule, RedisHealthCheckProvider } from '@/modules/health';
import { LoggingModule } from '@/modules/logging';
import { RedisModule } from '@/modules/redis';

@Module({
	imports: [
		ConfigModule.forRoot({
			cache: true,
			isGlobal: true,
			envFilePath: join(__dirname, '..', '.env'),
		}),
		LoggingModule.forPino({
			pinoHttp: {
				autoLogging: true,
				transport: { target: 'pino-pretty' },
				serializers: {
					req: req => ({
						id: req.id,
						ip: req.ip,
						hostname: req.hostname,
						method: req.method,
						url: req.url,
						query: req.query,
						params: req.params,
						'user-agent': req.headers?.['user-agent'],
					}),
					res: res => ({
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
export class AppModule implements OnApplicationShutdown {
	protected logger = new Logger(AppModule.name);

	onApplicationShutdown(signal?: string) {
		this.logger.warn(`Received signal ${signal ?? 'unknown'}, shutting down`);
	}
}
