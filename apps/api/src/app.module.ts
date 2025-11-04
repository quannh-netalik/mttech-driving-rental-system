import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Request, Response } from 'express';

import { LoggingModule } from '@/modules/logging';
import { DatabaseHealthCheckProvider, HealthModule } from '@/modules/health';
import { DatabaseModule } from '@/modules/database';
import * as configs from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [...Object.values(configs)],
    }),
    LoggingModule.forPino({
      pinoHttp: {
        autoLogging: true,
        transport: { target: 'pino-pretty' },
        serializers: {
          req: (req: Request) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
            params: req.params,
            ['user-agent']: req.headers?.['user-agent'],
          }),
          res: (res: Response) => ({
            statusCode: res.statusCode,
          }),
        },
      },
      exclude: ['/metrics', '/health'],
    }),
    DatabaseModule,
    HealthModule.forRoot([DatabaseHealthCheckProvider]),
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
