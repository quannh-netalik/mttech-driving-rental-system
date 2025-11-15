import { deleteCookie, getCookie, getRequestHeaders, setCookie } from '@tanstack/react-start/server';
import { type CookieProvider, HttpClient } from '@workspace/axios';
import { AuthApi, UserApi } from '@workspace/axios/api';
import { env } from '@/env/client';
import { DEFAULT_COOKIE_OPTIONS } from './constant';

const cookieProvider: CookieProvider = {
	getCookie,
	getRequestHeaders,
	setCookie,
	deleteCookie,
	defaultCookieOptions: {
		...DEFAULT_COOKIE_OPTIONS,
	},
};

/**
 * Creates request-scoped server API clients with automatic cookie/header handling.
 *
 * ⚠️ Must be called inside each `createServerFn` handler for proper request isolation.
 * Do not create a singleton at module scope to avoid leaking cookies/headers between requests.
 *
 * @example
 * export const getUserProfile = createServerFn({ method: 'GET' }).handler(async () => {
 *   const apiClients = createServerApiClients();
 *   return apiClients.user.profile();
 * });
 */
export const createServerApiClients = () => {
	const httpClient = new HttpClient({
		baseURL: env.VITE_SERVER_URL,
		cookieProvider,
	});

	let _user: UserApi;
	let _auth: AuthApi;

	return {
		get user() {
			return (_user ??= new UserApi(httpClient));
		},
		get auth() {
			return (_auth ??= new AuthApi(httpClient));
		},
	};
};
