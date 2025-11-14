import { getCookie, getRequestHeaders, setCookie } from '@tanstack/react-start/server';
import { HttpClient } from '@workspace/axios';
import { AuthApi, UserApi } from '@workspace/axios/api';
import { env } from '@/env/client';
import { DEFAULT_COOKIE_OPTIONS } from './constant';

/**
 * Creates a fresh set of server-side API clients with request-scoped context.
 *
 * ⚠️ Must be called inside each `createServerFn` handler** for proper request isolation.
 *
 * **DO NOT** create a singleton instance at module scope, as this will cause
 * request context leakage where subsequent requests incorrectly inherit cookies
 * and headers from the first request, leading to security vulnerabilities and
 * data leakage between users.
 *
 * @example
 * ```typescript
 * export const getUserProfile = createServerFn({ method: 'GET' })
 *   .handler(async () => {
 *     const apiClients = createServerApiClients();
 *     return await apiClients.user.profile();
 *   });
 * ```
 */
export const createServerApiClients = () => {
	const httpClient = new HttpClient({
		baseURL: env.VITE_SERVER_URL,
		cookieProvider: {
			getCookie,
			getRequestHeaders,
			setCookie,
			defaultCookieOptions: {
				...DEFAULT_COOKIE_OPTIONS,
			},
		},
	});

	return {
		get user() {
			return new UserApi(httpClient);
		},
		get auth() {
			return new AuthApi(httpClient);
		},
	};
};
