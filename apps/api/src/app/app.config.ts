import { registerAs } from '@nestjs/config';
import { APP_CONFIG, APP_DEVELOPMENT } from './app.constant';

export interface AppConfigOptions {
  env: string;
  port: number;
}

export const factory = registerAs(APP_CONFIG, () => {
  return {
    // current environment mode
    env: (process.env.NODE_ENV || APP_DEVELOPMENT).toLowerCase(),

    // default listen port
    port: process.env.API_PORT || 3030,
  };
});

export default factory;
