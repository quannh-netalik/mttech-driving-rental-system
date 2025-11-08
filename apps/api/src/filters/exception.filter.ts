import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import type { Request, Response } from 'express';

@Catch()
export class MTTechExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(MTTechExceptionFilter.name);

	catch(exception: Error, host: ArgumentsHost): void {
		const ctx: HttpArgumentsHost = host.switchToHttp();
		const response: Response = ctx.getResponse<Response>();
		const request: Request = ctx.getRequest<Request>();

		let httpStatus: number = HttpStatus.INTERNAL_SERVER_ERROR;
		let exceptionType: string = '';

		if (exception instanceof HttpException) {
			httpStatus = exception.getStatus();
			exceptionType = HttpException.name;
		} else {
			httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
			exceptionType = Error.name;
		}

		this.logger.error({
			path: request.url,
			method: request.method,
			status: httpStatus,
			exceptionType,
			timestamp: new Date().toISOString(),
			message: exception.message,
			requestId: request.correlationId,
			stack: exception.stack,
		});

		response.status(httpStatus).end();
	}
}
