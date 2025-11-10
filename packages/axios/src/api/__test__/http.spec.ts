import { localStorageServices } from '@workspace/axios/utils';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock window object before tests
vi.stubGlobal('window', {
	location: { href: '' },
});

// Setup window mock for test environment
Object.defineProperty(globalThis, 'window', {
	value: {
		location: { href: '' },
	},
	writable: true,
});

import { HttpClient } from '../http';

// Mock the localStorageServices
vi.mock('@workspace/axios/utils', () => ({
	localStorageServices: {
		getAccessToken: vi.fn(),
		getRefreshToken: vi.fn(),
		setAccessToken: vi.fn(),
		setRefreshToken: vi.fn(),
		clearAccessToken: vi.fn(),
		clearRefreshToken: vi.fn(),
	},
}));

// Mock window object
const mockWindow = <typeof globalThis.window>{
	location: { href: '' },
};

global.window = mockWindow;

describe('HttpClient', () => {
	let httpClient: HttpClient;
	let mockAxios: MockAdapter;
	const baseURL = 'https://api.example.com';
	let mockLocation: { href: string };

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks();

		// Mock window.location
		mockLocation = { href: '' };
		vi.stubGlobal('window', { location: mockLocation });

		// Create HttpClient instance
		httpClient = new HttpClient({ baseURL });

		// Create mock adapter for the internal axios instance
		// biome-ignore lint/suspicious/noExplicitAny: mock
		mockAxios = new MockAdapter((<any>httpClient).axiosInstance);
	});

	afterEach(() => {
		mockAxios.reset();
	});

	describe('Constructor', () => {
		it('should throw error if baseURL is not provided', () => {
			expect(() => new HttpClient()).toThrow('Base URL is required to create HttpClient instance');
		});

		it('should create instance with provided baseURL', () => {
			const client = new HttpClient({ baseURL: 'https://test.com' });
			expect(client).toBeInstanceOf(HttpClient);
		});
	});

	describe('Request Interceptor', () => {
		it('should add Authorization header when access token exists', async () => {
			const accessToken = 'test-access-token';
			vi.mocked(localStorageServices.getAccessToken).mockReturnValue(accessToken);

			mockAxios.onGet('/test').reply(config => {
				expect(config.headers?.Authorization).toBe(`Bearer ${accessToken}`);
				return [200, { success: true }];
			});

			await httpClient.get('/test');
		});

		it('should not add Authorization header when access token does not exist', async () => {
			vi.mocked(localStorageServices.getAccessToken).mockReturnValue(null);

			mockAxios.onGet('/test').reply(config => {
				expect(config.headers?.Authorization).toBeUndefined();
				return [200, { success: true }];
			});

			await httpClient.get('/test');
		});
	});

	describe('Response Interceptor - Success', () => {
		it('should return response data on successful request', async () => {
			const responseData = { message: 'success', data: [1, 2, 3] };
			mockAxios.onGet('/test').reply(200, responseData);

			const result = await httpClient.get('/test');
			expect(result).toEqual(responseData);
		});
	});

	describe('Response Interceptor - Non-401 Errors', () => {
		it('should reject with error for 400 status', async () => {
			mockAxios.onGet('/test').reply(400, { error: 'Bad Request' });

			await expect(httpClient.get('/test')).rejects.toThrow();
		});

		it('should reject with error for 403 status', async () => {
			mockAxios.onGet('/test').reply(403, { error: 'Forbidden' });

			await expect(httpClient.get('/test')).rejects.toThrow();
		});

		it('should reject with error for 500 status', async () => {
			mockAxios.onGet('/test').reply(500, { error: 'Internal Server Error' });

			await expect(httpClient.get('/test')).rejects.toThrow();
		});

		it('should reject with error for network errors', async () => {
			mockAxios.onGet('/test').networkError();

			await expect(httpClient.get('/test')).rejects.toThrow();
		});
	});

	describe('Token Refresh - Success Flow', () => {
		it('should refresh token and retry request on 401 error', async () => {
			const oldAccessToken = 'old-access-token';
			const newAccessToken = 'new-access-token';
			const refreshToken = 'refresh-token';

			vi.mocked(localStorageServices.getAccessToken).mockReturnValue(oldAccessToken);
			vi.mocked(localStorageServices.getRefreshToken).mockReturnValue(refreshToken);

			// Mock the refresh token endpoint
			const refreshMock = new MockAdapter(axios);
			refreshMock.onPost(`${baseURL}/auth/refresh`).reply(200, {
				accessToken: newAccessToken,
			});

			// First request fails with 401
			let requestCount = 0;
			mockAxios.onGet('/protected').reply(() => {
				requestCount++;
				if (requestCount === 1) {
					return [401, { error: 'Unauthorized' }];
				}
				return [200, { data: 'protected data' }];
			});

			const result = await httpClient.get('/protected');

			expect(result).toEqual({ data: 'protected data' });
			expect(localStorageServices.setAccessToken).toHaveBeenCalledWith(newAccessToken);
			expect(requestCount).toBe(2);

			refreshMock.restore();
		});

		it('should refresh token with new refresh token if provided', async () => {
			const oldAccessToken = 'old-access-token';
			const newAccessToken = 'new-access-token';
			const oldRefreshToken = 'old-refresh-token';
			const newRefreshToken = 'new-refresh-token';

			vi.mocked(localStorageServices.getAccessToken).mockReturnValue(oldAccessToken);
			vi.mocked(localStorageServices.getRefreshToken).mockReturnValue(oldRefreshToken);

			const refreshMock = new MockAdapter(axios);
			refreshMock.onPost(`${baseURL}/auth/refresh`).reply(200, {
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
			});

			mockAxios.onGet('/protected').replyOnce(401).onGet('/protected').reply(200, { data: 'success' });

			await httpClient.get('/protected');

			expect(localStorageServices.setAccessToken).toHaveBeenCalledWith(newAccessToken);
			expect(localStorageServices.setRefreshToken).toHaveBeenCalledWith(newRefreshToken);

			refreshMock.restore();
		});

		it('should not retry request that has already been retried', async () => {
			const accessToken = 'access-token';
			vi.mocked(localStorageServices.getAccessToken).mockReturnValue(accessToken);

			// Always return 401
			mockAxios.onGet('/protected').reply(401, { error: 'Unauthorized' });

			await expect(httpClient.get('/protected')).rejects.toThrow();

			// Should only be called once (no retry loop)
			expect(mockAxios.history.get.length).toBe(1);
		});
	});

	describe('Token Refresh - Queue Management', () => {
		it('should queue multiple requests during token refresh', async () => {
			const oldAccessToken = 'old-access-token';
			const newAccessToken = 'new-access-token';
			const refreshToken = 'refresh-token';

			vi.mocked(localStorageServices.getAccessToken).mockReturnValue(oldAccessToken);
			vi.mocked(localStorageServices.getRefreshToken).mockReturnValue(refreshToken);

			const refreshMock = new MockAdapter(axios);
			refreshMock.onPost(`${baseURL}/auth/refresh`).reply(200, {
				accessToken: newAccessToken,
			});

			// All requests fail with 401 first, then succeed
			const requestCounts = { req1: 0, req2: 0, req3: 0 };

			mockAxios.onGet('/protected1').reply(() => {
				requestCounts.req1++;
				if (requestCounts.req1 === 1) return [401, { error: 'Unauthorized' }];
				return [200, { data: 'data1' }];
			});

			mockAxios.onGet('/protected2').reply(() => {
				requestCounts.req2++;
				if (requestCounts.req2 === 1) return [401, { error: 'Unauthorized' }];
				return [200, { data: 'data2' }];
			});

			mockAxios.onGet('/protected3').reply(() => {
				requestCounts.req3++;
				if (requestCounts.req3 === 1) return [401, { error: 'Unauthorized' }];
				return [200, { data: 'data3' }];
			});

			// Fire multiple requests simultaneously
			const [result1, result2, result3] = await Promise.all([
				httpClient.get('/protected1'),
				httpClient.get('/protected2'),
				httpClient.get('/protected3'),
			]);

			expect(result1).toEqual({ data: 'data1' });
			expect(result2).toEqual({ data: 'data2' });
			expect(result3).toEqual({ data: 'data3' });

			// Token refresh should only happen once
			expect(refreshMock.history.post.length).toBe(1);

			refreshMock.restore();
		});
	});

	describe('Token Refresh - Failure Flow', () => {
		it('should clear tokens and redirect to login when refresh token is missing', async () => {
			const accessToken = 'access-token';
			vi.mocked(localStorageServices.getAccessToken).mockReturnValue(accessToken);
			vi.mocked(localStorageServices.getRefreshToken).mockReturnValue(null);

			mockAxios.onGet('/protected').reply(401, { error: 'Unauthorized' });

			await expect(httpClient.get('/protected')).rejects.toThrow('No refresh token available');

			expect(localStorageServices.clearAccessToken).toHaveBeenCalled();
			expect(localStorageServices.clearRefreshToken).toHaveBeenCalled();
		});

		it('should clear tokens and redirect to login when refresh endpoint fails', async () => {
			const accessToken = 'access-token';
			const refreshToken = 'refresh-token';

			vi.mocked(localStorageServices.getAccessToken).mockReturnValue(accessToken);
			vi.mocked(localStorageServices.getRefreshToken).mockReturnValue(refreshToken);

			const refreshMock = new MockAdapter(axios);
			refreshMock.onPost(`${baseURL}/auth/refresh`).reply(401, { error: 'Invalid refresh token' });

			mockAxios.onGet('/protected').reply(401, { error: 'Unauthorized' });

			await expect(httpClient.get('/protected')).rejects.toThrow();

			expect(localStorageServices.clearAccessToken).toHaveBeenCalled();
			expect(localStorageServices.clearRefreshToken).toHaveBeenCalled();

			refreshMock.restore();
		});

		it('should reject all queued requests when refresh fails', async () => {
			const accessToken = 'access-token';
			const refreshToken = 'refresh-token';

			vi.mocked(localStorageServices.getAccessToken).mockReturnValue(accessToken);
			vi.mocked(localStorageServices.getRefreshToken).mockReturnValue(refreshToken);

			const refreshMock = new MockAdapter(axios);
			refreshMock.onPost(`${baseURL}/auth/refresh`).reply(401, { error: 'Invalid refresh token' });

			mockAxios.onGet('/protected1').reply(401);
			mockAxios.onGet('/protected2').reply(401);
			mockAxios.onGet('/protected3').reply(401);

			// Fire multiple requests simultaneously
			const promises = Promise.all([
				httpClient.get('/protected1'),
				httpClient.get('/protected2'),
				httpClient.get('/protected3'),
			]);

			await expect(promises).rejects.toThrow();

			refreshMock.restore();
		});
	});

	describe('HTTP Methods', () => {
		it('should make GET request', async () => {
			mockAxios.onGet('/users').reply(200, { users: [] });

			const result = await httpClient.get('/users');
			expect(result).toEqual({ users: [] });
			expect(mockAxios.history.get.length).toBe(1);
		});

		it('should make POST request', async () => {
			const postData = { name: 'John' };
			mockAxios.onPost('/users', postData).reply(201, { id: 1, ...postData });

			const result = await httpClient.post('/users', { data: postData });
			expect(result).toEqual({ id: 1, ...postData });
			expect(mockAxios.history.post.length).toBe(1);
		});

		it('should make PUT request', async () => {
			const updateData = { name: 'Jane' };
			mockAxios.onPut('/users/1', updateData).reply(200, { id: 1, ...updateData });

			const result = await httpClient.put('/users/1', { data: updateData });
			expect(result).toEqual({ id: 1, ...updateData });
			expect(mockAxios.history.put.length).toBe(1);
		});

		it('should make DELETE request', async () => {
			mockAxios.onDelete('/users/1').reply(204);

			await httpClient.delete('/users/1');
			expect(mockAxios.history.delete.length).toBe(1);
		});

		it('should make custom request with method', async () => {
			mockAxios.onPatch('/users/1').reply(200, { updated: true });

			const result = await httpClient.request('patch', '/users/1', { data: { status: 'active' } });
			expect(result).toEqual({ updated: true });
		});
	});

	describe('Request Configuration', () => {
		it('should pass custom headers', async () => {
			mockAxios.onGet('/test').reply(config => {
				expect(config.headers?.['X-Custom-Header']).toBe('custom-value');
				return [200, { success: true }];
			});

			await httpClient.get('/test', {
				headers: {
					'X-Custom-Header': 'custom-value',
				},
			});
		});

		it('should pass query parameters', async () => {
			mockAxios.onGet('/users').reply(config => {
				expect(config.params).toEqual({ page: 1, limit: 10 });
				return [200, { users: [] }];
			});

			await httpClient.get('/users', {
				params: { page: 1, limit: 10 },
			});
		});

		it('should handle timeout configuration', async () => {
			mockAxios.onGet('/slow').reply(config => {
				expect(config.timeout).toBe(5000);
				return [200, { data: 'success' }];
			});

			await httpClient.get('/slow', {}, { timeout: 5000 });
		});
	});

	describe('Edge Cases', () => {
		it('should handle missing error.config gracefully', async () => {
			// Simulate error without config
			const errorWithoutConfig = {
				response: { status: 401 },
				config: undefined,
			};

			mockAxios.onGet('/test').reply(() => {
				return Promise.reject(errorWithoutConfig);
			});

			await expect(httpClient.get('/test')).rejects.toEqual(errorWithoutConfig);
		});

		it('should handle error without response object', async () => {
			const networkError = new Error('Network Error');

			mockAxios.onGet('/test').reply(() => {
				return Promise.reject(networkError);
			});

			await expect(httpClient.get('/test')).rejects.toThrow('Network Error');
		});

		it('should handle concurrent token refreshes correctly', async () => {
			const oldAccessToken = 'old-token';
			const newAccessToken = 'new-token';
			const refreshToken = 'refresh-token';

			vi.mocked(localStorageServices.getAccessToken).mockReturnValue(oldAccessToken);
			vi.mocked(localStorageServices.getRefreshToken).mockReturnValue(refreshToken);

			let refreshCallCount = 0;
			const refreshMock = new MockAdapter(axios);
			refreshMock.onPost(`${baseURL}/auth/refresh`).reply(() => {
				refreshCallCount++;
				// Simulate slow refresh
				return new Promise(resolve => {
					setTimeout(() => {
						resolve([200, { accessToken: newAccessToken }]);
					}, 100);
				});
			});

			let callCount = 0;
			mockAxios.onGet('/protected').reply(() => {
				callCount++;
				if (callCount <= 5) return [401, { error: 'Unauthorized' }];
				return [200, { data: 'success' }];
			});

			// Fire 5 requests at the same time
			const requests = Array(5)
				.fill(null)
				.map(() => httpClient.get('/protected'));
			await Promise.all(requests);

			// Should only refresh token once despite multiple concurrent 401s
			expect(refreshCallCount).toBe(1);
			expect(localStorageServices.setAccessToken).toHaveBeenCalledTimes(1);

			refreshMock.restore();
		});
	});
});
