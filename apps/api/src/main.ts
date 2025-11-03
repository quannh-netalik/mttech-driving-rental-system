import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import { inspect } from 'node:util';

import { AppModule } from './app/app.module';
import { LoggingModule } from './modules/logging';
import appConfig, { AppConfigOptions } from './app/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // register global logger
  const logger = LoggingModule.useLogger(app);

  // get listen port
  const { env, port } = app.get<AppConfigOptions>(appConfig.KEY);

  app.enableShutdownHooks();

  app.enableVersioning({
    defaultVersion: VERSION_NEUTRAL,
    type: VersioningType.URI,
  });

  app.use(helmet());
  app.use(compression());
  app.disable('x-powered-by');
  app.enableCors({
    origin: [],
    credentials: true,
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${inspect(reason)}`);
  });

  await app.listen(port, '0.0.0.0', async () => {
    const appUrl: string = await app.getUrl();
    logger.log(`🚀 Admin API running in ${env} stage at: ${appUrl}`);
  });
}

void bootstrap();
