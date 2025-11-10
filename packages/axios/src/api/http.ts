import { localStorageServices } from '@workspace/axios/utils';
import type { LoginResponseSchema } from '@workspace/schema';
import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
	type Method,
} from 'axios';
import qs from 'qs';

type RequestMethods = Extract<Method, 'get' | 'post' | 'put' | 'delete' | 'patch' | 'option' | 'head'>;

interface QueueItem {
	resolve: (value: string | null) => void;
	reject: (error: unknown) => void;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

const DEFAULT_TIMEOUT = 30000;

const defaultConfig: AxiosRequestConfig = {
	timeout: DEFAULT_TIMEOUT,
	headers: {
		Accept: 'application/json, text/plain, */*',
		'Content-Type': 'application/json',
		'X-Correlation-Id': crypto.randomUUID(),
	},
	paramsSerializer: {
		serialize: params => qs.stringify(params, { arrayFormat: 'repeat' }),
	},
};

export class HttpClient {
	private readonly axiosInstance: AxiosInstance;

	private refreshEndpoint = '/auth/refresh';

	private isRefreshing = false;
	private failedQueue: QueueItem[] = [];

	constructor({ baseURL, timeout }: Partial<AxiosRequestConfig> = {}) {
		if (!baseURL) {
			throw new Error('Base URL is required to create HttpClient instance');
		}

		this.axiosInstance = axios.create({
			...defaultConfig,
			timeout: timeout ?? defaultConfig.timeout,
			baseURL,
		});

		this.httpInterceptorsRequest();
		this.httpInterceptorsResponse();
	}

	// Process all queued requests after token refresh
	private processQueue(error: unknown = null, token: string | null = null): void {
		for (const promise of this.failedQueue) {
			if (error) {
				promise.reject(error);
			} else {
				promise.resolve(token);
			}
		}

		this.failedQueue = [];
	}

	private httpInterceptorsRequest(): void {
		this.axiosInstance.interceptors.request.use(
			config => {
				const accessToken = localStorageServices.getAccessToken();
				if (accessToken) {
					config.headers.Authorization = `Bearer ${accessToken}`;
				}

				return config;
			},
			error => {
				throw Promise.reject(error);
			},
		);
	}

	private httpInterceptorsResponse(): void {
		this.axiosInstance.interceptors.response.use(
			response => {
				return response.data;
			},
			async error => {
				const originalRequest = error.config as RetryableRequest | undefined;

				// For all non-401 errors, missing config, or already retried requests, reject immediately
				if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
					throw Promise.reject(error);
				}

				// Mark this request as retried to prevent infinite loops
				originalRequest._retry = true;

				// If already refreshing, queue this request
				if (this.isRefreshing) {
					return this.queueFailedRequest(originalRequest);
				}

				// Handle token refresh
				return this.handleTokenRefresh(originalRequest);
			},
		);
	}

	public setRefreshEndpoint(endpoint: string): void {
		this.refreshEndpoint = endpoint;
	}

	// Queue a failed request while token refresh is in progress
	private async queueFailedRequest(originalRequest: RetryableRequest): Promise<unknown> {
		const token = await new Promise<string | null>((resolve, reject) => {
			this.failedQueue.push({ resolve, reject });
		});

		originalRequest.headers.Authorization = `Bearer ${token}`;
		return this.axiosInstance(originalRequest);
	}

	// Handle the token refresh process
	private async handleTokenRefresh(originalRequest: RetryableRequest): Promise<unknown> {
		this.isRefreshing = true;

		try {
			const newAccessToken = await this.refreshAccessToken();

			// Update tokens and headers
			this.updateAuthorizationHeaders(newAccessToken, originalRequest);

			// Process queued requests
			this.processQueue(null, newAccessToken);

			// Retry the original request
			return this.axiosInstance(originalRequest);
		} catch (refreshError) {
			this.handleRefreshFailure(refreshError);
			return Promise.reject(refreshError);
		} finally {
			this.isRefreshing = false;
		}
	}

	// Refresh the access token using the refresh token
	private async refreshAccessToken(): Promise<string> {
		const refreshToken = localStorageServices.getRefreshToken();

		if (!refreshToken) {
			throw new Error('No refresh token available');
		}

		// Use axios directly here to avoid interceptor recursion
		const response = await axios.post<LoginResponseSchema>(
			`${this.axiosInstance.defaults.baseURL}${this.refreshEndpoint}`,
			{ refreshToken },
			{
				headers: { ...defaultConfig.headers },
			},
		);

		const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

		// Store new tokens
		localStorageServices.setAccessToken(newAccessToken);
		if (newRefreshToken) {
			localStorageServices.setRefreshToken(newRefreshToken);
		}

		return newAccessToken;
	}

	// Update authorization headers with new access token
	private updateAuthorizationHeaders(newAccessToken: string, originalRequest: RetryableRequest): void {
		this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
		originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
	}

	// Handle token refresh failure by clearing tokens and redirecting
	private handleRefreshFailure(refreshError: unknown): void {
		this.processQueue(refreshError, null);
		localStorageServices.clearAccessToken();
		localStorageServices.clearRefreshToken();
	}

	public request<T>(
		method: RequestMethods,
		url: string,
		param?: AxiosRequestConfig,
		axiosConfig?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> {
		const config = {
			method,
			url,
			...param,
			...axiosConfig,
		} as AxiosRequestConfig;
		return this.axiosInstance.request(config);
	}

	public post<T>(url: string, params?: AxiosRequestConfig, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.request<T>('post', url, params, config);
	}

	public get<T>(url: string, params?: AxiosRequestConfig, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.request<T>('get', url, params, config);
	}

	public put<T>(url: string, params?: AxiosRequestConfig, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.request<T>('put', url, params, config);
	}

	public delete<T>(url: string, params?: AxiosRequestConfig, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.request<T>('delete', url, params, config);
	}
}
