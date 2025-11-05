import { Injectable, Logger, LoggerService, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { createRedisOptions } from './redis.util';

@Injectable()
export class RedisFactory implements OnModuleInit, OnModuleDestroy {
  private readonly logger: LoggerService = new Logger(Redis.name);
  private readonly DISCONNECT_TIMEOUT = 100; // Very short timeout for hot reload

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

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Force disconnecting Redis connections for hot reload...');

    // Use Promise.race to implement timeout for each disconnect
    const disconnectWithTimeout = async (client: Redis) => {
      try {
        await Promise.race([
          new Promise<void>(resolve => {
            client.disconnect(false);
            resolve();
          }),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Disconnect timeout')), this.DISCONNECT_TIMEOUT),
          ),
        ]);
      } catch (err) {
        // If timeout occurs, we've already called disconnect so just log
        this.logger.warn('Redis disconnect timed out, continuing...');
      }
    };

    // Disconnect all clients with timeout
    await Promise.all([...this.clients].map(disconnectWithTimeout));

    // Clear the set immediately
    this.clients.clear();
    this.logger.log('All Redis connections forcefully disconnected');
  }

  public getClient(): Redis {
    return this.redisClient;
  }

  private createRedisClient(options: RedisOptions): Redis {
    const redisHost = `${options.host}:${options.port}`;
    const client = new Redis(options);

    // Add basic logging
    client.on('connect', () => this.logger.log(`Connected to Redis at ${redisHost}`));
    client.on('ready', () => this.logger.log('Redis instance is ready'));
    client.on('close', () => this.logger.warn('Redis connection closed'));
    client.on('error', err => this.logger.error('Redis connection error:', err));

    // Track the client
    this.clients.add(client);

    return client;
  }
}
