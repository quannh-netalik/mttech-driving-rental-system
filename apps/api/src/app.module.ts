import { join } from 'node:path';
import { DynamicModule, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loggerConfig } from '@/config';
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

	public static forRoot({ appName, usePino }: AppModuleConfig): DynamicModule {
		return {
			module: AppModule,
			imports: [usePino ? LoggingModule.forPino(loggerConfig) : LoggingModule.forRoot({ appName })],
		};
	}

	onApplicationShutdown(signal?: string) {
		this.logger.warn(`Received signal ${signal ?? 'unknown'}, shutting down`);
	}
}
