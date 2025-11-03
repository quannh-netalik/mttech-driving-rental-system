import { join } from 'node:path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DataSourceOptions } from 'typeorm/browser';

export const AppDataSource: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  synchronize: false, // disable when production
  logging: ['schema', 'info', 'warn'],
  entities: ['dist/**/*.entity.{js,ts}'],
  namingStrategy: new SnakeNamingStrategy(),
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
  extra: {
    idleTimeoutMillis: 1000, // close idle clients after 1 second
    maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)

    // number of milliseconds to wait before timing out when connecting a new client
    // by default this is 0 which means no timeout
    connectionTimeoutMillis: 1000,
  },
};
