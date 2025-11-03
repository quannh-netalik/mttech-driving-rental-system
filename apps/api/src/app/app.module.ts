import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './app.config';
import { APP_NAME } from './app.constant';
import { LoggingModule } from '../modules/logging';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    LoggingModule.forPino({
      pinoHttp: {
        name: APP_NAME,
        autoLogging: true,
        transport: { target: 'pino-pretty' },
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
            params: req.params,
            ['user-agent']: req.headers?.['user-agent'],
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
      exclude: ['/metrics', '/health'],
    }),
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
