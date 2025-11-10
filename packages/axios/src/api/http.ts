import { localStorageServices } from '@workspace/axios/utils';
import axios, { type AxiosInstance, type AxiosRequestConfig, type Method } from 'axios';
import qs from 'qs';

interface HttpClientRequestConfig extends AxiosRequestConfig {
	url: string;
}

type RequestMethods = Extract<Method, 'get' | 'post' | 'put' | 'delete' | 'patch' | 'option' | 'head'>;

const defaultConfig: AxiosRequestConfig = {
	timeout: 30000,
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
	private axiosInstance: AxiosInstance;

	constructor({ baseURL }: Partial<AxiosRequestConfig> = {}) {
		if (!baseURL) {
			throw new Error('Base URL is required to create HttpClient instance');
		}

		this.axiosInstance = axios.create({
			...defaultConfig,
			baseURL,
		});

		this.httpInterceptorsRequest();
		this.httpInterceptorsResponse();
	}

	private httpInterceptorsRequest(): void {
		this.axiosInstance.interceptors.request.use(
			config => {
				const token = localStorageServices.getAccessToken();
				config.headers.Authorization = `Bearer ${token}`;
				return config;
			},
			error => Promise.reject(error),
		);
	}

	private httpInterceptorsResponse(): void {
		this.axiosInstance.interceptors.response.use(
			response => {
				return response.data;
			},
			async error => Promise.reject(error),
		);
	}

	public request<T>(
		method: RequestMethods,
		url: string,
		param?: AxiosRequestConfig,
		axiosConfig?: HttpClientRequestConfig,
	): Promise<T> {
		const config = {
			method,
			url,
			...param,
			...axiosConfig,
		} as HttpClientRequestConfig;
		return this.axiosInstance.request(config);
	}

	public post<T>(url: string, params?: AxiosRequestConfig, config?: HttpClientRequestConfig) {
		console.log({ url, params, config });
		return this.request<T>('post', url, params, config);
	}

	public get<T>(url: string, params?: AxiosRequestConfig, config?: HttpClientRequestConfig) {
		return this.request<T>('get', url, params, config);
	}

	public put<T>(url: string, params?: AxiosRequestConfig, config?: HttpClientRequestConfig) {
		return this.request<T>('put', url, params, config);
	}

	public delete<T>(url: string, params?: AxiosRequestConfig, config?: HttpClientRequestConfig) {
		return this.request<T>('delete', url, params, config);
	}
}
