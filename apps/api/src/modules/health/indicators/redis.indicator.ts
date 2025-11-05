import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';

import { RedisService } from '@/modules/redis';

const DEFAULT_TIMEOUT = 1000;

export interface RedisHealthIndicatorOptions {
  /**
   * The timeout (in ms) for the health check operation
   * @default 1000
   */
  timeout?: number;
}

@Injectable()
export class RedisHealthIndicator {
  constructor(private readonly redisService: RedisService) {}

  async isHealthy(key: string, options: RedisHealthIndicatorOptions = {}): Promise<HealthIndicatorResult> {
    const timeout = options.timeout ?? DEFAULT_TIMEOUT;

    try {
      const testValue = Date.now();

      // Create a promise that resolves to true if Redis operations succeed
      const healthCheckPromise = (async (): Promise<boolean> => {
        const redisKey = `health-check:${key}:${process.pid}:${Date.now()}`;
        // Set TTL longer than timeout to ensure auto-cleanup of orphaned keys
        await this.redisService.set(redisKey, testValue, timeout * 3);
        const result = await this.redisService.get<number>(redisKey);
        await this.redisService.del(redisKey);
        return result === testValue;
      })();

      // Create a timeout promise that rejects after the specified timeout
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Health check failed: timeout after ${timeout}ms`));
        }, timeout);
      });

      // Race between timeout and health check
      const isHealthy = await Promise.race([healthCheckPromise, timeoutPromise]);

      return {
        [key]: {
          status: isHealthy ? 'up' : 'down',
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Redis connection failed';
      return {
        [key]: {
          status: 'down',
          message: errorMessage,
        },
      };
    }
  }
}
