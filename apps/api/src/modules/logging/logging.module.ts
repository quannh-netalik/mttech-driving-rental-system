import { DynamicModule, INestApplicationContext, LoggerService, Module } from '@nestjs/common';
import { Logger, LoggerModule, Params } from 'nestjs-pino';
import { LOGGING_LOGGER } from './logging.constant';

/**
 * Driver-agnostic logging module
 **/
@Module({})
export class LoggingModule {
	public static forPino(params: Params = {}): DynamicModule {
		return {
			module: LoggingModule,
			imports: [LoggerModule.forRoot(params)],
			providers: [{ provide: LOGGING_LOGGER, useExisting: Logger }],
			exports: [LoggerModule, LOGGING_LOGGER],
		};
	}

	/**
	 * Set up app logger
	 *
	 * @param app
	 */
	public static useLogger(app: INestApplicationContext): LoggerService {
		const logger = app.get<LoggerService>(LOGGING_LOGGER);

		// use as default logger
		app.useLogger(logger);

		return logger;
	}
}
