import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

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
      user: UserEntity;
		}
	}
}
