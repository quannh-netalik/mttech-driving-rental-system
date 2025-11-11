import { AppEnvironment, NestAppConfigOptions } from '@/types';

// current environment mode
const env = <AppEnvironment>(process.env.NODE_ENV || 'development').toLowerCase();

// default listen port
const port = +(process.env.API_PORT || 3030);

const appHost = process.env.APP_HOST;
if (env === 'production' && !appHost) {
	throw new Error('APP_HOST is required in production');
}

// biome-ignore lint/style/noNonNullAssertion: having null check above
const host = env === 'production' ? process.env.APP_HOST! : `http://localhost:${port}`;

export const appConfig: NestAppConfigOptions = {
	env,
	host,
	port,
};
