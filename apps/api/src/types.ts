export type AppEnvironment = 'development' | 'production' | 'test' | 'staging';

export interface NestAppConfigOptions {
  env: AppEnvironment;
  port: number;
  adminPublicUrl: string;
}
