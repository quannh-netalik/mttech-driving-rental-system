import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { createRedisOptions } from '@/modules/redis';

import { ConfigGetter, EnvConfigGetter } from './data-source.util';

/**
 * Build a TypeORM DataSourceOptions object configured for PostgreSQL using values from `config`.
 *
 * The returned configuration includes connection credentials and host/port, environment-driven schema synchronization (enabled unless `NODE_ENV` is `'production'`), query logging, snake_case naming strategy, entity and migration file globs, connection pool/timeouts, additional driver `extra` options, and a Redis-backed query cache configured via `createRedisOptions()`.
 *
 * @param config - Configuration accessor used to read required database and environment values (e.g., `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `NODE_ENV`).
 * @returns A fully populated `DataSourceOptions` object ready to initialize a TypeORM DataSource for PostgreSQL.
 */
export function createDataSourceOptions(config: ConfigGetter): DataSourceOptions {
  const isProduction = config.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: config.getOrThrow<string>('DB_HOST'),
    port: config.getOrThrow<number>('DB_PORT'),
    database: config.getOrThrow<string>('DB_NAME'),
    username: config.getOrThrow<string>('DB_USER'),
    password: config.getOrThrow<string>('DB_PASS'),
    synchronize: !isProduction,
    logging: ['schema', 'info', 'warn'],
    namingStrategy: new SnakeNamingStrategy(),
    poolSize: 10,
    connectTimeoutMS: 5000,
    entities: [join(__dirname, '..', '/entities/*.entity.{ts,js}')],
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
