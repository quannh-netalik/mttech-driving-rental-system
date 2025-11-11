import './env';

import { inspect } from 'node:util';
import compression from '@fastify/compress';
import fastifyCsrf from '@fastify/csrf-protection';
import helmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { ClassSerializerInterceptor, ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { appConfig } from '@/config';
import { HttpExceptionFilter } from '@/filters';
import { LoggingModule } from '@/modules/logging';
import { buildOpenApiConfig, genReqId } from '@/utils';
import pkg from '../package.json';
import { AppModule } from './app.module';

/**
 * Bootstraps and starts the NestJS application using a Fastify adapter, applying global configuration
 * security and rate-limit plugins, API versioning and validation, OpenAPI documentation, and logging.
 */
async function bootstrap() {
	const start = performance.now();

	const { host, isProduction, env, port, originAllowList, rateLimiting, usePino } = appConfig;

	const _AppModule = AppModule.forRoot({
		appName: pkg.name,
		usePino,
	});
	const app = await NestFactory.create<NestFastifyApplication>(
		_AppModule,
		new FastifyAdapter({
			trustProxy: isProduction,
			logger: false,
			genReqId,
		}),
		{ bufferLogs: true },
	);

	// Fastify plugins
	await app.register(compression);
	await app.register(helmet);
	await app.register(fastifyCsrf);
	await app.register(fastifyRateLimit, {
		max: rateLimiting,
		timeWindow: '1 minute',
	});

	// register global logger
	const logger = LoggingModule.useLogger(app);

	// get listen port

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

	useContainer(app.select(_AppModule), { fallbackOnErrors: true });

	app.enableCors({
		origin: isProduction ? originAllowList : '*',
		methods: ['GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-request-id'],
		credentials: true,
	});

	// OpenAPI
	const document = SwaggerModule.createDocument(app, buildOpenApiConfig(port), {
		operationIdFactory: (_: string, methodKey: string) => methodKey,
	});
	SwaggerModule.setup('api/docs', app, document, {
		ui: true,
	});

	process.on('unhandledRejection', reason => {
		logger.error(`Unhandled Rejection: ${inspect(reason)}`);
	});

	// By default, Fastify listens only on the localhost 127.0.0.1 interface.
	// Specify '0.0.0.0' to accept connections on other hosts
	// https://fastify.dev/docs/latest/Guides/Getting-Started/#your-first-server
	await app.listen(port, '0.0.0.0', async () => {
		logger.log(`🚀 Admin API is running in ${env} stage at: ${host}/api`);
		logger.log(`📚 API documentation is running at ${host}/api/docs`);

		// Measuring
		const duration = Number(performance.now() - start).toFixed(0);
		logger.log(`✅ Bootstrap completed in ${duration}ms`);
	});

	return app;
}

void bootstrap();
