import { randomUUID } from 'node:crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export const getCorrelationId = (req: Request): string => {
	const correlationId = (req.headers['x-correlation-id'] || req.headers['x-request-id'] || randomUUID()) as string;
	return correlationId;
};

@Injectable()
export class XCorrelationIdMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction): void {
		const correlationId = getCorrelationId(req);

		// Get existing request ID from headers or generate new one
		// Set request ID in request object for later use
		req.correlationId = correlationId;

		// Set request ID in response headers
		res.setHeader('x-correlation-id', correlationId);

		// Add request ID to response locals for logging
		res.locals.correlationId = correlationId;

		next();
	}
}
