import type { LoginResponseSchema } from '@workspace/schema';
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { CookieSerializeOptions } from 'cookie-es';
import { nanoid } from 'nanoid';
import pino from 'pino';
import qs from 'qs';
import { COOKIE_TOKENS } from './token';

export interface CookieProvider {
	getCookie: (name: string) => string | undefined;
	setCookie: (name: string, value: string, options?: CookieSerializeOptions) => void;
	defaultCookieOptions: CookieSerializeOptions;
	getRequestHeaders: () => Headers;
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
	private readonly cookieProvider: CookieProvider;

	private readonly refreshController: UrlPath = '/auth';
	private refreshEndpoint: UrlPath = '/refresh';
	private isRefreshing = false;

	private refreshPromise: Promise<string> | null = null;

	constructor({ baseURL, timeout, cookieProvider }: Partial<HttpClientConfig>) {
		if (!baseURL) {
			throw new Error('Base URL is required to create HttpClient instance');
		}

		if (!cookieProvider) {
			throw new Error('Cookie provider is not provided');
		}

		this.cookieProvider = cookieProvider;

		this.axiosInstance = axios.create({
			...defaultConfig,
			timeout: timeout ?? defaultConfig.timeout,
			baseURL,
		});

		this.setupInterceptors();
	}

	public setRefreshEndpoint(endpoint: UrlPath): void {
		this.refreshEndpoint = endpoint;
	}

	private setupInterceptors(): void {
		// Request interceptor: Add auth token and request ID
		this.axiosInstance.interceptors.request.use(
			async config => {
				// Get all cookies if available
				const headers = this.cookieProvider.getRequestHeaders();
				const cookies = headers.get('cookie');
				if (cookies) {
					config.headers.Cookie = cookies;
				}

				// Get access token
				const token = this.cookieProvider.getCookie(COOKIE_TOKENS.ACCESS_TOKEN);
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}

				config.headers['X-Request-Id'] = nanoid();
				return config;
			},
			error => Promise.reject(error),
		);

		// Response interceptor: Handle 401 and token refresh
		this.axiosInstance.interceptors.response.use(
			response => response.data,
			error => this.handleResponseError(error),
		);
	}

	private async handleResponseError(error: unknown): Promise<unknown> {
		const axiosError = error as AxiosError;
		const originalRequest = axiosError.config as RetryableRequest | undefined;

		// If no access token was sent, this is a real 401 (not auth issue)
		const hasAccessToken = !!this.cookieProvider.getCookie(COOKIE_TOKENS.ACCESS_TOKEN);

		// Only handle 401 errors with valid config that haven't been retried and have tokens
		if (!originalRequest || axiosError.response?.status !== 401 || originalRequest._retry || !hasAccessToken) {
			return Promise.reject(error);
		}

		this.logger.info('Failed request detected - fetching new tokens...');
		// Check if we have both access token (that failed) and refresh token
		const refreshToken = this.cookieProvider.getCookie(COOKIE_TOKENS.REFRESH_TOKEN);

		// If we had access token but no refresh token, can't refresh - clear auth
		if (!refreshToken) {
			this.logger.warn('Refresh token not found - rejecting...');
			this.handleAuthFailure();
			return Promise.reject(error);
		}

		originalRequest._retry = true;

		// Wait for existing refresh or start new one
		if (this.isRefreshing && this.refreshPromise) {
			try {
				await this.refreshPromise;
				const newToken = this.cookieProvider.getCookie(COOKIE_TOKENS.ACCESS_TOKEN);
				if (newToken) {
					originalRequest.headers = originalRequest.headers || {};
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					return this.axiosInstance(originalRequest);
				}
			} catch (error) {
				this.handleAuthFailure();
				return Promise.reject(error);
			}
		}

		// Start token refresh
		return this.refreshAndRetry(originalRequest);
	}

	private async refreshAndRetry(originalRequest: RetryableRequest): Promise<unknown> {
		this.isRefreshing = true;
		this.refreshPromise = this.performTokenRefresh();

		try {
			const newToken = await this.refreshPromise;
			originalRequest.headers = originalRequest.headers || {};
			originalRequest.headers.Authorization = `Bearer ${newToken}`;
			return this.axiosInstance(originalRequest);
		} catch (error) {
			this.logger.error(`Error in refetching token ${JSON.stringify(error)}`);
			this.handleAuthFailure();
			throw error;
		} finally {
			this.isRefreshing = false;
			this.refreshPromise = null;
		}
	}

	private async performTokenRefresh(): Promise<string> {
		const refreshToken = this.cookieProvider.getCookie(COOKIE_TOKENS.REFRESH_TOKEN);

		if (!refreshToken) {
			throw new Error('No refresh token available');
		}

		const response = await this.post<LoginResponseSchema>(this.refreshController, this.refreshEndpoint, {
			data: { refreshToken },
		});

		if (!response) {
			throw new Error('Fetch failed');
		}

		this.logger.info(`Fetched new tokens successfully: ${response}`);

		const { accessToken, refreshToken: newRefreshToken } = response;

		// Set new tokens via cookie provider
		this.cookieProvider.setCookie(COOKIE_TOKENS.ACCESS_TOKEN, accessToken, {
			...this.cookieProvider.defaultCookieOptions,
			maxAge: 15 * 60, // 15 minutes
		});

		this.cookieProvider.setCookie(COOKIE_TOKENS.REFRESH_TOKEN, newRefreshToken, {
			...this.cookieProvider.defaultCookieOptions,
			maxAge: 7 * 24 * 60 * 60, // 7 days
		});

		this.logger.info('Successfully set new tokens in cookies');

		return accessToken;
	}

	private handleAuthFailure(): void {
		// Clear tokens
		this.cookieProvider.setCookie(COOKIE_TOKENS.ACCESS_TOKEN, '', {
			maxAge: -1,
		});
		this.cookieProvider.setCookie(COOKIE_TOKENS.REFRESH_TOKEN, '', {
			maxAge: -1,
		});
	}

	public request<T>(method: RequestMethods, controller: UrlPath, url: UrlPath, param?: AxiosRequestConfig): Promise<T> {
		return this.axiosInstance.request({
			method,
			url: controller + url,
			...param,
		});
	}

	public post<T>(controller: UrlPath, url: UrlPath, params?: AxiosRequestConfig): Promise<T> {
		return this.request<T>('post', controller, url, params);
	}

	public get<T>(controller: UrlPath, url: UrlPath, params?: AxiosRequestConfig): Promise<T> {
		return this.request<T>('get', controller, url, params);
	}

	public put<T>(controller: UrlPath, url: UrlPath, params?: AxiosRequestConfig): Promise<T> {
		return this.request<T>('put', controller, url, params);
	}

	public delete<T>(controller: UrlPath, url: UrlPath, params?: AxiosRequestConfig): Promise<T> {
		return this.request<T>('delete', controller, url, params);
	}
}
