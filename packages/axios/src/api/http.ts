import { authStoreService } from '@workspace/axios/storages';
import type { LoginResponseSchema } from '@workspace/schema';
import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
	type Method,
} from 'axios';
import { nanoid } from 'nanoid';
import qs from 'qs';

type RequestMethods = Extract<Method, 'get' | 'post' | 'put' | 'delete' | 'patch' | 'option' | 'head'>;

interface PendingRequest {
	resolve: (token: string) => void;
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
	},
	paramsSerializer: {
		serialize: params => qs.stringify(params, { arrayFormat: 'repeat' }),
	},
};

export class HttpClient {
	private readonly axiosInstance: AxiosInstance;
	private refreshEndpoint = '/auth/refresh';
	private isRefreshing = false;
	private pendingRequests: PendingRequest[] = [];
	private onAuthFailure?: () => void;

	constructor({ baseURL, timeout }: Partial<AxiosRequestConfig> = {}) {
		if (!baseURL) {
			throw new Error('Base URL is required to create HttpClient instance');
		}

		this.axiosInstance = axios.create({
			...defaultConfig,
			timeout: timeout ?? defaultConfig.timeout,
			baseURL,
		});

		this.setupInterceptors();
	}

	public setRefreshEndpoint(endpoint: string): void {
		this.refreshEndpoint = endpoint;
	}

	public setAuthFailureHandler(handler: () => void): void {
		this.onAuthFailure = handler;
	}

	private setupInterceptors(): void {
		// Request interceptor: Add auth token and correlation ID
		this.axiosInstance.interceptors.request.use(
			config => {
				const accessToken = authStoreService.getAccessToken();
				if (accessToken) {
					config.headers.Authorization = `Bearer ${accessToken}`;
				}
				config.headers['X-Correlation-Id'] = nanoid();
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
		const axiosError = error as { config?: RetryableRequest; response?: { status: number } };
		const originalRequest = axiosError.config;

		// If no access token was sent, this is a real 401 (not auth issue)
		const hasAccessToken = !!authStoreService.getAccessToken();

		// Only handle 401 errors with valid config that haven't been retried or no tokens
		if (!originalRequest || axiosError.response?.status !== 401 || originalRequest._retry || !hasAccessToken) {
			return Promise.reject(error);
		}

		// Check if we have both access token (that failed) and refresh token
		const refreshToken = authStoreService.getRefreshToken();

		// If we had access token but no refresh token, can't refresh - clear auth
		if (!refreshToken) {
			this.handleAuthFailure();
			return Promise.reject(error);
		}

		originalRequest._retry = true;

		// Queue request if refresh is already in progress
		if (this.isRefreshing) {
			const newToken = await this.waitForTokenRefresh();
			originalRequest.headers.Authorization = `Bearer ${newToken}`;
			return this.axiosInstance(originalRequest);
		}

		// Start token refresh
		return this.refreshAndRetry(originalRequest);
	}

	private async waitForTokenRefresh(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			this.pendingRequests.push({ resolve, reject });
		});
	}

	private async refreshAndRetry(originalRequest: RetryableRequest): Promise<unknown> {
		this.isRefreshing = true;

		try {
			const newToken = await this.performTokenRefresh();
			originalRequest.headers.Authorization = `Bearer ${newToken}`;
			this.resolvePendingRequests(newToken);
			return this.axiosInstance(originalRequest);
		} catch (error) {
			this.rejectPendingRequests(error);
			this.handleAuthFailure();
			throw error;
		} finally {
			this.isRefreshing = false;
		}
	}

	private async performTokenRefresh(): Promise<string> {
		const refreshToken = authStoreService.getRefreshToken();

		const response = await axios.post<LoginResponseSchema>(
			`${this.axiosInstance.defaults.baseURL}${this.refreshEndpoint}`,
			{ refreshToken },
			{ headers: defaultConfig.headers },
		);

		const { accessToken, refreshToken: newRefreshToken } = response.data;

		authStoreService.setAccessToken(accessToken);
		if (newRefreshToken) {
			authStoreService.setRefreshToken(newRefreshToken);
		}

		this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

		return accessToken;
	}

	private resolvePendingRequests(token: string): void {
		this.pendingRequests.forEach(request => {
			request.resolve(token);
		});
		this.pendingRequests = [];
	}

	private rejectPendingRequests(error: unknown): void {
		this.pendingRequests.forEach(request => {
			request.reject(error);
		});
		this.pendingRequests = [];
	}

	private handleAuthFailure(): void {
		authStoreService.clearAccessToken();
		authStoreService.clearRefreshToken();
		this.onAuthFailure?.();
	}

	public request<T>(
		method: RequestMethods,
		url: string,
		param?: AxiosRequestConfig,
		axiosConfig?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> {
		return this.axiosInstance.request({
			method,
			url,
			...param,
			...axiosConfig,
		});
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
