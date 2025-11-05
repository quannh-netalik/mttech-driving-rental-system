import { Injectable, Logger, LoggerService, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { createRedisOptions } from './redis.util';

@Injectable()
export class RedisFactory implements OnModuleInit {
  private readonly logger: LoggerService = new Logger(Redis.name);

  private readonly clients: Set<Redis> = new Set();

  private redisClient: Redis;

  constructor() {
    const options = createRedisOptions();
    this.redisClient = this.createRedisClient(options);
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing Redis connection...');
    try {
      // Test the connection
      await this.redisClient.ping();
      this.logger.log('Redis connection initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Redis connection', error);
      throw error; // This will prevent the application from starting
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
        this.logger.log(`Connected to Redis at ${redisHost}`);
      })
      .on('ready', () => {
        this.logger.log('Redis instance is ready');
      })
      .on('close', () => {
        this.logger.warn('Redis connection closed');
      })
      .on('error', err => {
        this.logger.error('Redis connection error:', err);
      });

    this.clients.add(client);
    return client;
  }
}
