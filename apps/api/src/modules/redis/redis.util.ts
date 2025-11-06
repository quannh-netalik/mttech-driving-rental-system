import { RedisOptions } from 'ioredis';

export const createRedisOptions = (): RedisOptions => {
  const port = Number(process.env.REDIS_PORT || '6379');
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error('Invalid REDIS_PORT: must be a number between 1 and 65535');
  }

  const host = process.env.REDIS_HOST || 'localhost';
  if (!host || host.trim().length === 0) {
    throw new Error('Invalid REDIS_HOST: must be a non-empty string');
  }

  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_PASSWORD) {
    throw new Error('REDIS_PASSWORD is required in production environment');
  }

  const keyPrefix = 'mttech-v2:';

  // create Redis connection options
  const opts: RedisOptions = {
    port,
    host,
    password: process.env.REDIS_PASSWORD,
    showFriendlyErrorStack: true,
    autoResubscribe: true,
    enableAutoPipelining: true,
    maxRetriesPerRequest: 5,
    keyPrefix,
  };

  return opts;
};
