import { getCookie, getRequestHeaders, setCookie } from '@tanstack/react-start/server';
import { HttpClient } from '@workspace/axios';
import { AuthApi, UserApi } from '@workspace/axios/api';
import { env } from '@/env/client';

export const createServerApiClients = () => {
	const httpClient = new HttpClient({
		baseURL: env.VITE_SERVER_URL,
		withCredentials: true,
		cookieProvider: {
			getCookie,
			getRequestHeaders,
			setCookie,
			defaultCookieOptions: {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
				maxAge: undefined,
			},
		},
	});

	return {
		user: new UserApi(httpClient),
		auth: new AuthApi(httpClient),
	};
};

export const apiClients = createServerApiClients();
