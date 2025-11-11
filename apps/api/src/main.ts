import './env';

import { inspect } from 'node:util';
import compression from '@fastify/compress';
import fastifyCsrf from '@fastify/csrf-protection';
import helmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ClassSerializerInterceptor, ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule } from '@nestjs/swagger';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';
import { useContainer } from 'class-validator';
import { appConfig } from '@/config';
import { HttpExceptionFilter } from '@/filters';
import { LoggingModule } from '@/modules/logging';
import { buildOpenApiConfig, genReqId } from '@/utils';
import { AppModule } from './app.module';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [new ReadonlyVisitor({ introspectComments: true, pathToSource: __dirname })],
  outputDir: __dirname,
  watch: true,
  tsconfigPath: './tsconfig.json',
});

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
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
    max: +(process.env.APP_RATE_LIMIT || 100),
    timeWindow: '1 minute',
  });

  // register global logger
  const logger = LoggingModule.useLogger(app);

  // get listen port
  const { host, env, port } = appConfig;

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

  app.enableCors({
    origin: ['http://localhost:3000', `http://localhost:${port}`],
    methods: ['GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Correlation-ID'],
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

  await app.listen(port, '0.0.0.0', async () => {
    logger.log(`🚀 Admin API is running in ${env} stage at: ${host}/api`);
    logger.log(`📚 API documentation is running at ${host}/api/docs`);
  });
}

void bootstrap();
