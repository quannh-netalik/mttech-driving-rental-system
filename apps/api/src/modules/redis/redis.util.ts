import { RedisOptions } from 'ioredis';

export const createRedisOptions = (): RedisOptions => {
  const keyPrefix = 'mttech-v1-';

  // create Redis connection options
  const opts: RedisOptions = {
    port: +(process.env.REDIS_PORT || 6379),
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true,
    showFriendlyErrorStack: true,
    autoResubscribe: true,
    enableAutoPipelining: true,
    maxRetriesPerRequest: 5,
    keyPrefix,
  };

  return opts;
};
