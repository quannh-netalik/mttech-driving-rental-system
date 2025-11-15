/** biome-ignore-all lint/complexity/useLiteralKeys: ignore-headers */
import { Params as PinoParams } from 'nestjs-pino';
import { appConfig } from './app.config';

const pretty = true;

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
				authorization: req.headers['authorization'],
				['user-agent']: req.headers['user-agent'],
			}),
			res: res => ({
				statusCode: res.statusCode,
			}),
		},
	},
	exclude: ['/metrics', '/health', '/.well-known', '/docs', '/docs/*splat'],
};
