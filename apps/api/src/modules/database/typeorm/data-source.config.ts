import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const DATA_SOURCE_CONFIG = 'data-source-config';

export const dataSourceConfig = registerAs(
  DATA_SOURCE_CONFIG,
  (): Partial<DataSourceOptions> => {
    return {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
    };
  },
);
