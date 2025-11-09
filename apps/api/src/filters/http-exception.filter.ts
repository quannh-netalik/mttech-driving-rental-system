import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { ErrorResponse } from '@/types/error.type';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

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

		const error: ErrorResponse = {
			path: request.url,
			method: request.method,
			status: httpStatus,
			exceptionType,
			timestamp: new Date().toISOString(),
			message: exception.message,
			requestId: request.correlationId,
			stack: exception.stack,
		};

		this.logger.error(error);

		response.status(httpStatus).json(error);
	}
}
