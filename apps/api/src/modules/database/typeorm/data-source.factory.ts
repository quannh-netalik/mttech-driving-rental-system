import type { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { join } from 'node:path';

import { createRedisOptions } from '@/modules/redis';

import { ConfigGetter, EnvConfigGetter } from './data-source.util';

export function createDataSourceOptions(config: ConfigGetter): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.getOrThrow<string>('DB_HOST'),
    port: config.getOrThrow<number>('DB_PORT'),
    database: config.getOrThrow<string>('DB_NAME'),
    username: config.getOrThrow<string>('DB_USER'),
    password: config.getOrThrow<string>('DB_PASS'),
    synchronize: false,
    logging: ['schema', 'info', 'warn'],
    namingStrategy: new SnakeNamingStrategy(),
    entities: [join(__dirname, '../../..', '/**/*.entity.js')],
    migrations: [join(__dirname, '..', 'migrations/*.js')],
    extra: {
      idleTimeoutMillis: 1000,
      maxUses: 7500,
      connectionTimeoutMillis: 1000,
    },
    cache: {
      duration: +(process.env.TYPEORM_CACHE_DURATION || 60000), // 1 minute,
      alwaysEnabled: false,
      ignoreErrors: true,
      type: 'ioredis',
      options: createRedisOptions(),
    },
  };
}

// For CLI usage
export const AppDataSource = createDataSourceOptions(new EnvConfigGetter());
