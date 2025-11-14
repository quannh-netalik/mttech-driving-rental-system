import type { InternalAxiosRequestConfig, Method } from 'axios';

export declare global {
	type UrlPath = `/${string}`;

	// Axios Config Types
	type RequestMethods = Extract<Method, 'get' | 'post' | 'put' | 'delete' | 'patch' | 'option' | 'head'>;

	interface PendingRequest {
		resolve: (token: string) => void;
		reject: (error: unknown) => void;
	}

	interface RetryableRequest extends InternalAxiosRequestConfig {
		_retry?: boolean;
	}
}
