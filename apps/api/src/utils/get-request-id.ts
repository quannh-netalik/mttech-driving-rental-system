import { RawRequestDefaultExpression, RawServerBase } from 'fastify';
import { nanoid } from 'nanoid';

export const genReqId = (req: RawRequestDefaultExpression<RawServerBase>): string => {
	const header = req.headers['x-request-id'];

	if (typeof header === 'string' && header.length > 0 && header.length <= 64) {
		return header;
	}

	return nanoid();
};
