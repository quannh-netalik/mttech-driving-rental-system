import './env';

import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor, ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import { inspect } from 'node:util';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { useContainer } from 'class-validator';

import { LoggingModule } from '@/modules/logging';
import { AppModule } from './app.module';
import { appConfig } from './config';
import { NestAppConfigOptions } from './types';
import { buildOpenApiConfig } from './utils';

import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [new ReadonlyVisitor({ introspectComments: true, pathToSource: __dirname })],
  outputDir: __dirname,
  watch: true,
  tsconfigPath: './tsconfig.json',
});

/**
 * Bootstraps and starts the NestJS application, configuring global middleware, validation, versioning, OpenAPI documentation, security headers, CORS, logging, and shutdown hooks.
 *
 * This function initializes the application container, registers the global logger, applies global pipes and interceptors, configures class-validator DI fallback, enables common middlewares (helmet, compression), sets proxy and CORS policies, generates and mounts the OpenAPI document at /docs with a customized operationIdFactory, attaches a docs-specific middleware stack, registers an unhandled rejection handler, and begins listening on the configured port.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // register global logger
  const logger = LoggingModule.useLogger(app);

  // get listen port
  const { host, env, port } = app.get<NestAppConfigOptions>(appConfig.KEY);

  app.enableShutdownHooks();

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

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(helmet());
  app.use(compression());
  app.disable('x-powered-by');
  app.enableCors({
    origin: [`http://localhost:${port}`, `http://127.0.0.1:${port}`],
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