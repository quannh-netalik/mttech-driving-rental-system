import { UserEntity } from '@/modules/database/entities';

export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
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
