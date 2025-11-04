import { Injectable, Logger, LoggerService, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { createRedisOptions } from './redis.util';

@Injectable()
export class RedisFactory implements OnModuleDestroy {
  private readonly logger: LoggerService = new Logger(Redis.name);

  private readonly clients: Set<Redis> = new Set();

  private redisClient: Redis;

  constructor() {
    const options = createRedisOptions();
    this.redisClient = this.createRedisClient(options);
  }

  async onModuleDestroy() {
    for (const redis of this.clients) {
      await redis.quit();
    }
  }

  public getClient(): Redis {
    return this.redisClient;
  }

  private createRedisClient(options: RedisOptions): Redis {
    const redisHost = `${options.host}:${options.port}`;

    // create Redis client
    const client = new Redis(options);

    // bind all events
    client
      .on('connect', () => {
        this.logger.log(`Connecting to Redis at ${redisHost}`);
      })
      .on('ready', () => {
        this.logger.log('Redis instance is ready');
      })
      .on('close', () => {
        this.logger.log('Redis connection closed');
      })
      .on('error', err => {
        this.logger.error(err.message || err.toString?.());
      });

    // disconnect on module destroy
    this.clients.add(client);

    return client;
  }
}
