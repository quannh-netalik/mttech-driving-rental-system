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
    synchronize: config.get('NODE_ENV') !== 'production',
    logging: ['schema', 'info', 'warn'],
    namingStrategy: new SnakeNamingStrategy(),
    poolSize: 10,
    connectTimeoutMS: 5000,
    entities: [join(__dirname, '../../..', '/**/*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', '/migrations/*.ts')],
    extra: {
      idleTimeoutMillis: 30000,
      maxUses: 7500,
      connectionTimeoutMillis: 5000,
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
