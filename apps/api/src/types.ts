export type AppEnvironment = 'development' | 'production' | 'test' | 'staging';

export interface NestAppConfigOptions {
	host: string;
	isProduction: boolean;
	env: AppEnvironment;
	port: number;

	// TODO adminPublicUrl: string;
}
