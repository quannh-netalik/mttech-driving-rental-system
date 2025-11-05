import './env';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import { inspect } from 'node:util';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { AppModule } from './app.module';
import { LoggingModule } from './modules/logging';
import { appConfig } from './config';
import { NestAppConfigOptions } from './types';
import { buildOpenApiConfig } from './utils';

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

  app.use(
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
          scriptSrc: ["'self'", "'unsafe-inline'", 'unpkg.com', 'cdn.jsdelivr.net'],
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
  );
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
  SwaggerModule.setup('api', app, document, {
    ui: false,
  });

  app.use(
    '/api',
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
    logger.log(`📚 API documentation is running at ${host}/api`);
  });
}

void bootstrap();
