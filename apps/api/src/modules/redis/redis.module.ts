import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisService } from './redis.service';
import { RedisFactory } from './redis.factory';

@Global()
@Module({
  imports: [],
  providers: [
    RedisFactory,
    {
      provide: Redis,
      useFactory: (redisFactory: RedisFactory) => redisFactory.getClient(),
      inject: [RedisFactory],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
