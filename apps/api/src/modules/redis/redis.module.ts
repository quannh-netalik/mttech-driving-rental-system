import { Global, Module } from '@nestjs/common';
import { RedisModule as NestRedisIOModule } from '@nestjs-modules/ioredis';

import { RedisService } from './redis.service';
import { createRedisOptions } from './redis.util';
import { RedisFactory } from './redis.factory';

@Global()
@Module({
  imports: [
    NestRedisIOModule.forRoot({
      type: 'single',
      options: createRedisOptions(),
    }),
  ],
  providers: [RedisService, RedisFactory],
  exports: [RedisService],
})
export class RedisModule {}
