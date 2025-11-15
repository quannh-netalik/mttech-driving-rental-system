import type { LoginResponseSchema } from '@workspace/schema';
import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from 'axios';
import type { CookieSerializeOptions } from 'cookie-es';
import { nanoid } from 'nanoid';
import pino from 'pino';
import qs from 'qs';
import { COOKIE_TOKENS } from './token';

export interface CookieProvider {
	getCookie: (name: string) => string | undefined;
	setCookie: (name: string, value: string, options?: CookieSerializeOptions) => void;
	deleteCookie: (name: string, options?: CookieSerializeOptions) => void;
	defaultCookieOptions: CookieSerializeOptions;
	getRequestHeaders: () => Headers;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

export interface HttpClientConfig extends AxiosRequestConfig {
	cookieProvider: CookieProvider;
}

const DEFAULT_TIMEOUT = 30000;

const defaultConfig: AxiosRequestConfig = {
	timeout: DEFAULT_TIMEOUT,
	headers: {
		Accept: 'application/json, text/plain, */*',
		'Content-Type': 'application/json',
	},
	paramsSerializer: {
		serialize: params => qs.stringify(params, { arrayFormat: 'repeat' }),
	},
};

export class HttpClient {
	private readonly logger = pino({
		msgPrefix: `[HttpClient] `,
	});
	private readonly axiosInstance: AxiosInstance;
	public readonly cookieProvider: CookieProvider;

	private refreshEndpoint = '/auth/refresh';

	// Use Promise instead of boolean to prevent race conditions
	private refreshTokenPromise: Promise<string> | null = null;

	constructor({
		baseURL,
		timeout,
		cookieProvider,
	}: Partial<HttpClientConfig> & Required<Pick<HttpClientConfig, 'baseURL' | 'cookieProvider'>>) {
		this.cookieProvider = cookieProvider;

		this.refreshEndpoint = `${baseURL}${this.refreshEndpoint}`;

		this.axiosInstance = axios.create({
			...defaultConfig,
			timeout: timeout ?? defaultConfig.timeout,
			baseURL,
		});

		this.setupInterceptors();
	}

	private setupInterceptors(): void {
		// Request interceptor: Add auth token and request ID
		this.axiosInstance.interceptors.request.use(
			async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
				// Get all cookies if available
				const headers = this.cookieProvider.getRequestHeaders();
				const cookies = headers.get('cookie');
				if (cookies) {
					config.headers.Cookie = cookies;
				}

				// Only set Authorization if not already set (e.g., during retry after refresh)
				if (!config.headers.Authorization && !config.headers['X-Has-Auth-Token']) {
					const accessToken = this.cookieProvider.getCookie(COOKIE_TOKENS.ACCESS_TOKEN);
					if (accessToken) {
						config.headers.Authorization = `Bearer ${accessToken}`;
					}
				}

				// Remove the marker header before sending
				if (config.headers['X-Has-Auth-Token']) {
					delete config.headers['X-Has-Auth-Token'];
				}

				config.headers['X-Request-Id'] = nanoid();
				return config;
			},
			(error: Error): Promise<never> => Promise.reject(error),
		);

		// Response interceptor: Handle 401 and token refresh
		this.axiosInstance.interceptors.response.use(
			(response: AxiosResponse) => response.data,
			async (error: unknown): Promise<AxiosResponse> => this.handleResponseError(error),
		);
	}

	private async handleResponseError(error: unknown): Promise<AxiosResponse> {
		if (!axios.isAxiosError(error)) {
			return Promise.reject(error);
		}

		const originalRequest = error.config as RetryableRequest | undefined;

		// Check if we have a valid config and it's a 401 error
		if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
			this.logger.info('Authentication failed!');
			return Promise.reject(error);
		}

		// Mark this request as retried
		originalRequest._retry = true;

		try {
			// If refresh is already in progress, wait for it
			// Otherwise, start a new refresh
			if (!this.refreshTokenPromise) {
				this.logger.info('Starting token refresh...');
				this.refreshTokenPromise = this.refreshAccessToken().finally(() => {
					// Clear the promise when done
					this.refreshTokenPromise = null;
				});
			} else {
				this.logger.info('Token refresh already in progress, waiting...');
			}

			// Wait for the refresh to complete (whether we started it or not)
			const newAccessToken = await this.refreshTokenPromise;

			// Update authorization header with new token
			if (originalRequest.headers) {
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				// Mark that this request already has a token to prevent interceptor from overwriting
				originalRequest.headers['X-Has-Auth-Token'] = 'true';
			}

			this.logger.info('Retrying request with new token');

			// Retry original request
			return this.axiosInstance(originalRequest);
		} catch (refreshError) {
			this.logger.error('Token refresh failed');

			// Clear the promise on error
			this.refreshTokenPromise = null;

			return Promise.reject(refreshError);
		}
	}

	private async refreshAccessToken(): Promise<string> {
		const refreshToken = this.cookieProvider.getCookie(COOKIE_TOKENS.REFRESH_TOKEN);
		if (!refreshToken) {
			throw new Error('No refresh token available');
		}

		try {
			this.logger.info('Calling refresh token endpoint...');

			// Use base axios instance (not the intercepted one) to avoid infinite loops
			const response: AxiosResponse<LoginResponseSchema> = await axios.post(
				this.refreshEndpoint,
				{ refreshToken },
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);

			this.logger.info('Refresh token response received');

			// Update cookies with new tokens (both are required)
			this.cookieProvider.setCookie(COOKIE_TOKENS.ACCESS_TOKEN, response.data.accessToken, {
				...this.cookieProvider.defaultCookieOptions,
				maxAge: 15 * 60, // 15 minutes
			});

			this.cookieProvider.setCookie(COOKIE_TOKENS.REFRESH_TOKEN, response.data.refreshToken, {
				...this.cookieProvider.defaultCookieOptions,
				maxAge: 7 * 24 * 60 * 60, // 7 days
			});

			return response.data.accessToken;
		} catch (error) {
			this.logger.error('Refresh token request failed');

			this.clearTokens();
			throw error instanceof Error ? error : new Error('Failed to refresh access token');
		}
	}

	private clearTokens(): void {
		this.cookieProvider.deleteCookie(COOKIE_TOKENS.ACCESS_TOKEN);
		this.cookieProvider.deleteCookie(COOKIE_TOKENS.REFRESH_TOKEN);
	}

	public request<T>(method: string, controller: string, url: string, param?: AxiosRequestConfig): Promise<T> {
		return this.axiosInstance.request({
			method,
			url: controller + url,
			...param,
		});
	}

	public post<T>(controller: string, url: string, params?: AxiosRequestConfig): Promise<T> {
		return this.request<T>('post', controller, url, params);
	}

	public get<T>(controller: string, url: string, params?: AxiosRequestConfig): Promise<T> {
		return this.request<T>('get', controller, url, params);
	}

	public put<T>(controller: string, url: string, params?: AxiosRequestConfig): Promise<T> {
		return this.request<T>('put', controller, url, params);
	}

	public delete<T>(controller: string, url: string, params?: AxiosRequestConfig): Promise<T> {
		return this.request<T>('delete', controller, url, params);
	}
}
