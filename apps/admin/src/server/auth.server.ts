import { createServerFn } from '@tanstack/react-start';
import { setCookie } from '@tanstack/react-start/server';
import { COOKIE_TOKENS } from '@workspace/axios/token';
import { zLoginRequestSchema } from '@workspace/schema';
import { apiClients } from './api.client';
import { errorHandler } from './middleware/error-handling.middleware';

export const signInFn = createServerFn({ method: 'POST' })
	.inputValidator(zLoginRequestSchema)
	.middleware([errorHandler])
	.handler(async ({ data }) => {
		const result = await apiClients.auth.signIn(data);

		setCookie(COOKIE_TOKENS.ACCESS_TOKEN, result.accessToken, {
			maxAge: 15 * 60, // 15 minutes
		});

		setCookie(COOKIE_TOKENS.REFRESH_TOKEN, result.refreshToken, {
			maxAge: 7 * 24 * 60 * 60, // 7 days
		});

		return result;
	});
