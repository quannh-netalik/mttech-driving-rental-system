import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(Redis) private readonly redis: Redis) {}

  public async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      const stack = error instanceof Error ? error.stack : JSON.stringify(error);
      this.logger.error('Redis ping operation failed', stack);
      throw new InternalServerErrorException('Failed to ping Redis');
    }
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      // Safe serialization - handles circular references and undefined
      let serialized: string;
      try {
        serialized = typeof value === 'string' ? value : JSON.stringify(value);
      } catch (serializationError) {
        const stack =
          serializationError instanceof Error ? serializationError.stack : JSON.stringify(serializationError);

        this.logger.error(`Failed to serialize value for key "${key}"`, stack);
        throw new InternalServerErrorException('Failed to serialize value for cache storage');
      }

      // Perform Redis operation
      if (ttl) {
        await this.redis.set(key, serialized, 'PX', ttl);
      } else {
        await this.redis.set(key, serialized);
      }

      this.logger.debug(`Successfully set Redis key: ${key}${ttl ? ` with TTL: ${ttl}ms` : ''}`);
    } catch (error) {
      // Don't expose the actual value in the error message (security)
      if (error instanceof InternalServerErrorException) {
        throw error; // Re-throw our own exceptions
      }
      const stack = error instanceof Error ? error.stack : JSON.stringify(error);
      this.logger.error(`Redis set operation failed for key "${key}"`, stack);
      throw new InternalServerErrorException(`Failed to store data in cache for key "${key}"`);
    }
  }

  public async get<T = string>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value === null) return null;

      // Try to parse as JSON, fall back to raw string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T; // Return raw string if not JSON
      }
    } catch (error) {
      const stack = error instanceof Error ? error.stack : JSON.stringify(error);
      this.logger.error(`Redis get operation failed for key "${key}"`, stack);
      throw new InternalServerErrorException(`Failed to retrieve data from cache`);
    }
  }

  public async del(key: string): Promise<boolean> {
    try {
      const removed = await this.redis.del(key);
      return removed > 0;
    } catch (error) {
      const stack = error instanceof Error ? error.stack : JSON.stringify(error);
      this.logger.error(`Redis del operation failed for key "${key}"`, stack);
      throw new InternalServerErrorException(`Failed to delete data from cache`);
    }
  }
}
