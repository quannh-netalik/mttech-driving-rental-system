/** biome-ignore-all lint/complexity/useLiteralKeys: ignore-headers */
import { Params as PinoParams } from 'nestjs-pino';
import { appConfig } from './app.config';

const pretty = Boolean(process.env.PINO_PRETTY_FORMAT);

export const loggerConfig: PinoParams = {
	pinoHttp: {
		autoLogging: true,
		transport:
			!appConfig.isProduction && pretty
				? {
						// Only apply pino-pretty for dev mode and enabled pretty config
						target: 'pino-pretty',
						options: {
							colorize: true,
						},
					}
				: undefined,
		serializers: {
			req: req => ({
				id: req.id,
				ip: req.ip || req.raw?.ip,
				hostname: req.hostname,
				method: req.method,
				url: req.url,
				query: req.query,
				params: req.params,
				['user-agent']: req.headers['user-agent'],
			}),
			res: res => ({
				statusCode: res.statusCode,
			}),
		},
	},
	exclude: ['/metrics', '/health', '/.well-known', '/docs', '/docs/*splat'],
};
