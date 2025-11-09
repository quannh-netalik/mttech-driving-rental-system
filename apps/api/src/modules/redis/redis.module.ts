import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisFactory } from './redis.factory';
import { RedisService } from './redis.service';

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
