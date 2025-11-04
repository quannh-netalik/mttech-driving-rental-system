import { AppEnvironment, NestAppConfigOptions } from '@/types';
import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('appConfig', (): NestAppConfigOptions => {
  return {
    // current environment mode
    env: <AppEnvironment>(process.env.NODE_ENV || 'development').toLowerCase(),

    // default listen port
    port: +(process.env.API_PORT || 3030),

    // cors config
    adminPublicUrl: process.env.ADMIN_PUBLIC_URL || 'http://localhost:3030',
  };
});
