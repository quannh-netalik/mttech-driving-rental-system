const env = process.env.NODE_ENV || 'development';

const isProduction = env === 'production';

// default listen port
const port = +(process.env.API_PORT || 3030);

const appHost = process.env.APP_HOST;
let originAllowList: string[] = [];

if (isProduction) {
	if (!appHost) {
		throw new Error('APP_HOST is required in production');
	}

	if (!process.env.ORIGIN_ALLOW_LIST) {
		throw new Error('APP_HOST is required in production');
	}

	const origins = process.env.ORIGIN_ALLOW_LIST.split(' ');
	originAllowList = origins;
}

const host = isProduction && appHost ? appHost : `http://localhost:${port}`;

// Always use Pino in production mode
const usePino = isProduction || Boolean(process.env.USE_PINO);

const rateLimiting = +(process.env.APP_RATE_LIMIT || 100);

export const appConfig: NestAppConfigOptions = {
	env,
	isProduction,
	host,
	port,
	originAllowList,
	rateLimiting,
	usePino,
};
