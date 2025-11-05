export type AppEnvironment = 'development' | 'production' | 'test' | 'staging';

export interface NestAppConfigOptions {
  host: string;
  env: AppEnvironment;
  port: number;

  // TODO adminPublicUrl: string;
}
