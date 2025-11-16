import type { InternalAxiosRequestConfig, Method } from 'axios';

export declare global {
	type UrlPath = `/${string}`;

	// Axios Config Types
	type RequestMethods = Extract<Method, 'get' | 'post' | 'put' | 'delete' | 'patch' | 'option' | 'head'>;

	interface RetryableRequest extends InternalAxiosRequestConfig {
		_retry?: boolean;
	}

	interface QueuedRequest<T = string> {
		resolve: (value: T) => void;
		reject: (reason: unknown) => void;
	}
}
