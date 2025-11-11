import { join } from 'node:path';
import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loggerConfig } from '@/config';
import { AuthModule } from '@/modules/auth';
import { DatabaseModule } from '@/modules/database';
import { DatabaseHealthCheckProvider, HealthModule, RedisHealthCheckProvider } from '@/modules/health';
import { LoggingModule } from '@/modules/logging';
import { RedisModule } from '@/modules/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),
    LoggingModule.forPino(loggerConfig),
    RedisModule,
    DatabaseModule,
    HealthModule.forRoot([DatabaseHealthCheckProvider, RedisHealthCheckProvider]),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnApplicationShutdown {
  protected logger = new Logger(AppModule.name);

  onApplicationShutdown(signal?: string) {
    this.logger.warn(`Received signal ${signal ?? 'unknown'}, shutting down`);
  }
}
