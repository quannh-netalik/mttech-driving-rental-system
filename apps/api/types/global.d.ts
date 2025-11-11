import { UserEntity } from '@/modules/database/entities';

export declare global {
	type AppEnvironment = 'development' | 'production' | 'test' | 'staging';

	interface NestAppConfigOptions {
		host: string;
		isProduction: boolean;
		env: AppEnvironment;
		port: number;
		originAllowList: string[];
		rateLimiting: number;
		usePino: boolean;
	}

	interface AppModuleConfig {
		appName: string;
		usePino: boolean;
	}

	interface ErrorResponse {
		path: string;
		method: string;
		status: number;
		exceptionType: string;
		timestamp: string;
		message: string;
		requestId: string;
		stack?: string | undefined;
	}

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: AppEnvironment;

			// App Config
			API_PORT: string;
			ORIGIN_ALLOW_LIST: string;

			// DB Config
			DB_HOST: string;
			DB_PORT: string;
			DB_USER: string;
			DB_PASS;
			DB_NAME: string;

			// Redis Config
			REDIS_HOST: string;
			REDIS_PORT: string;
			REDIS_PASSWORD: string;
			REDIS_TTL: string;

			// Jwt Config
			JWT_SECRET: string;
			JWT_AC_TTL: string;
			JWT_RF_TTL: string;

			USE_PINO: string;
		}
	}
}

declare module 'fastify' {
	interface FastifyRequest {
		user?: UserEntity;
	}
}
