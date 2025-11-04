import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Injectable, Logger, LoggerService } from '@nestjs/common';

@Injectable()
export class RedisService {
  private readonly logger: LoggerService = new Logger(RedisService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  public async set<T extends string | number>(key: string, value: T, ttl?: number): Promise<T> {
    if (ttl) {
      await this.redis.set(key, value, 'PX', ttl);
    } else {
      await this.redis.set(key, value);
    }

    return value;
  }

  public async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  public async del(key: string): Promise<boolean> {
    await this.redis.del(key);
    return true;
  }
}
