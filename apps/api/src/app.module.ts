import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Request, Response } from 'express';
import { join } from 'node:path';

import { LoggingModule } from '@/modules/logging';
import { RedisModule } from '@/modules/redis';
import { DatabaseModule } from '@/modules/database';
import { DatabaseHealthCheckProvider, HealthModule, RedisHealthCheckProvider } from '@/modules/health';
import * as configs from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: Object.values(configs),
      envFilePath: join(__dirname, '..', '.env'),
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
    RedisModule,
    DatabaseModule,
    HealthModule.forRoot([DatabaseHealthCheckProvider, RedisHealthCheckProvider]),
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
