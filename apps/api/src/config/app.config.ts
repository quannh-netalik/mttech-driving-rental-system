
const env = process.env.NODE_ENV || 'development';

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
  isProduction: env === 'production',
  host,
  port,
};
