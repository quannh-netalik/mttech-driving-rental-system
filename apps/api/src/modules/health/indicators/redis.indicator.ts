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
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Health check failed: timeout after ${timeout}ms`));
        }, timeout);
      });

      // Create the health check promise
      const healthCheckPromise = (async () => {
        const testValue = Date.now().toString();
        await this.redisService.set('health-check', testValue);
        const result = await this.redisService.get('health-check');
        return result === testValue;
      })();

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
