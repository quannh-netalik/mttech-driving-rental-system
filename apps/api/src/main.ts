import './env';

import { inspect } from 'node:util';
import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ClassSerializerInterceptor, ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';
import { apiReference } from '@scalar/nestjs-api-reference';
import { useContainer } from 'class-validator';
import compression from 'compression';
import helmet from 'helmet';
import { LoggingModule } from '@/modules/logging';
import { AppModule } from './app.module';
import { appConfig } from './config';
import { HttpExceptionFilter } from './filters';
import { NestAppConfigOptions } from './types';
import { buildOpenApiConfig } from './utils';

const generator = new PluginMetadataGenerator();
generator.generate({
	visitors: [new ReadonlyVisitor({ introspectComments: true, pathToSource: __dirname })],
	outputDir: __dirname,
	watch: true,
	tsconfigPath: './tsconfig.json',
});

/**
 * Bootstraps and starts the NestJS HTTP server for the application.
 *
 * Configures global application behavior (logging, API prefix and versioning, validation, serialization,
 * exception filtering, and dependency container wiring), applies security and performance middleware (helmet,
 * compression, CORS, proxy trust), generates and mounts OpenAPI documentation at /docs with a CSP-aware
 * configuration, registers an unhandled rejection handler that logs errors, and begins listening on the
 * configured port.
 */
async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bufferLogs: false,
	});

	// register global logger
	const logger = LoggingModule.useLogger(app);

	// get listen port
	const { host, env, port } = app.get<NestAppConfigOptions>(appConfig.KEY);

	app.enableShutdownHooks();

	app.setGlobalPrefix('api');

	app.enableVersioning({
		defaultVersion: VERSION_NEUTRAL,
		type: VersioningType.URI,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidUnknownValues: true,
			stopAtFirstError: true,
		}),
	);

	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
	app.useGlobalFilters(new HttpExceptionFilter());

	useContainer(app.select(AppModule), { fallbackOnErrors: true });

	app.use(helmet());
	app.use(compression());
	app.disable('x-powered-by');
	app.enableCors({
		origin: [`http://localhost:${port}`, `http://127.0.0.1:${port}`],
		methods: ['GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
		credentials: true,
	});

	app.set('trust proxy', 1);

	// OpenAPI
	const document = SwaggerModule.createDocument(app, buildOpenApiConfig(port), {
		operationIdFactory: (_: string, methodKey: string) => methodKey,
	});
	SwaggerModule.setup('docs', app, document, {
		ui: false,
	});

	app.use(
		'/docs',
		// Scalar requires custom config for CSP
		// Apply only for Scalar Docs
		helmet({
			crossOriginEmbedderPolicy: false,
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: [
						"'self'",
						"'unsafe-inline'",
						'unpkg.com',
						'cdn.jsdelivr.net',
						'fonts.googleapis.com',
						'fonts.scalar.com',
					],
					fontSrc: ["'self'", 'fonts.gstatic.com', 'fonts.scalar.com'],
					scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'unpkg.com', 'cdn.jsdelivr.net'],
					connectSrc: [
						"'self'",
						'unpkg.com',
						'cdn.jsdelivr.net',
						`http://localhost:${port}`,
						`http://127.0.0.1:${port}`,
					],
					imgSrc: ["'self'", 'data:', 'cdn.jsdelivr.net'],
				},
			},
		}),
		apiReference({
			theme: 'kepler',
			_integration: 'nestjs',
			darkMode: true,
			defaultHttpClient: {
				targetKey: 'node',
				clientKey: 'axios',
			},
			persistAuth: true,
			isLoading: true,
			content: document,
			showToolbar: 'never',
			documentDownloadType: 'none',
		}),
	);

	process.on('unhandledRejection', reason => {
		logger.error(`Unhandled Rejection: ${inspect(reason)}`);
	});

	await app.listen(port, async () => {
		logger.log(`🚀 Admin API is running in ${env} stage at: ${host}`);
		logger.log(`📚 API documentation is running at ${host}/docs`);
	});
}

void bootstrap();