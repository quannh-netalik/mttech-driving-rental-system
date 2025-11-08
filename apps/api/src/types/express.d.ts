import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

declare global {
	namespace Express {
		interface Request<
			P = ParamsDictionary,
			ResBody = any,
			ReqBody = any,
			ReqQuery = ParsedQs,
			Locals extends Record<string, any> = Record<string, any>,
		> {
			correlationId: string;
		}

		interface Response {
			correlationId: string;
		}
	}
}
