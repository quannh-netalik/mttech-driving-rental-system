import { UserEntity } from '@/modules/database/entities';

export declare global {
  type AppEnvironment = 'development' | 'production' | 'test' | 'staging';

  interface NestAppConfigOptions {
    host: string;
    isProduction: boolean;
    env: AppEnvironment;
    port: number;
  }

  interface ErrorResponse {
    path: string;
    method: string;
    status: number;
    exceptionType: string;
    timestamp: string;
    message: string;
    requestId: string;
    stack?: string | undefined;
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: AppEnvironment;
      PORT: string;

      DATABASE_URL: string;
      JWT_SECRET: string;
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: UserEntity;
  }
}
