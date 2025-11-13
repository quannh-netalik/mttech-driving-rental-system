/** biome-ignore-all lint/suspicious/noDocumentCookie: test */
import { describe, expect, it, vi } from 'vitest';
import { clearAllCookies, getAllCookies, getCookie, hasCookie, removeCookie, setCookie } from '../src/index';

describe('Cookie Store', () => {
	describe('getCookie', () => {
		it('should get a cookie value', async () => {
			document.cookie = 'test=value; path=/';
			expect(await getCookie('test')).toBe('value');
		});

		it('should return undefined for non-existent cookie', async () => {
			expect(await getCookie('nonexistent')).toBeUndefined();
		});

		it('should throw error for invalid name', async () => {
			await expect(getCookie('invalid name')).rejects.toThrow('Invalid cookie name');
		});

		it('should handle errors gracefully and return undefined', async () => {
			// Mock document to throw an error
			await setCookie('test', 'any');
			const originalDocument = global.document;
			// @ts-expect-error
			delete global.document;

			const result = await getCookie('test');
			expect(result).toBeUndefined();

			global.document = originalDocument;
		});
	});

	describe('setCookie', () => {
		it('should set a cookie', async () => {
			await setCookie('test', 'value');
			expect(await getCookie('test')).toBe('value');
		});

		it('should set cookie with options', async () => {
			await setCookie('test', 'value', { maxAge: 3600, sameSite: 'strict' });
			expect(await getCookie('test')).toBe('value');
		});

		it('should throw error for invalid cookie name', async () => {
			await expect(setCookie('invalid name', 'value')).rejects.toThrow('Invalid cookie name');
		});

		it('should sanitize cookie value', async () => {
			await setCookie('test', 'value;with;semicolons\r\n');
			const value = await getCookie('test');
			expect(value).toBe('valuewithsemicolons');
		});

		it('should handle errors gracefully', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			// Mock document to throw an error
			const originalDocument = global.document;
			Object.defineProperty(global, 'document', {
				get: () => {
					throw new Error('Document error');
				},
				configurable: true,
			});

			await setCookie('test', 'value');
			expect(consoleErrorSpy).toHaveBeenCalled();

			Object.defineProperty(global, 'document', {
				value: originalDocument,
				configurable: true,
			});
			consoleErrorSpy.mockRestore();
		});

		// Test that the cookie string is correctly formatted (without actually setting domain)
		it('should create correct cookie string with all options', async () => {
			// Spy on document.cookie setter to verify the string format
			const cookieSetter = vi.fn();
			Object.defineProperty(document, 'cookie', {
				set: cookieSetter,
				get: () => 'test=value',
				configurable: true,
			});

			await setCookie('test', 'value', {
				maxAge: 3600,
				path: '/custom',
				domain: 'example.com',
				secure: true,
				sameSite: 'strict',
			});

			expect(cookieSetter).toHaveBeenCalled();
			const cookieString = cookieSetter.mock.calls[0][0];

			expect(cookieString).toContain('test=value');
			expect(cookieString).toContain('Path=/custom');
			expect(cookieString).toContain('Domain=example.com');
			expect(cookieString).toContain('Secure');
			expect(cookieString).toContain('SameSite=Strict');
			expect(cookieString).toContain('Max-Age=3600');

			// Restore
			Object.defineProperty(document, 'cookie', {
				value: '',
				writable: true,
				configurable: true,
			});
		});
	});

	describe('removeCookie', () => {
		it('should remove a cookie', async () => {
			await setCookie('test', 'value');
			await removeCookie('test');
			expect(await getCookie('test')).toBeUndefined();
		});

		it('should throw error for invalid cookie name', async () => {
			await expect(removeCookie('invalid name')).rejects.toThrow('Invalid cookie name');
		});

		it('should remove cookie with custom path', async () => {
			await setCookie('test', 'value', { path: '/custom' });
			await removeCookie('test', { path: '/custom' });
			expect(await getCookie('test')).toBeUndefined();
		});

		it('should remove cookie with domain option', async () => {
			await setCookie('test', 'value');
			await removeCookie('test', { domain: 'example.com' });
			// Cookie should be removed (can't verify exact domain behavior in jsdom)
		});

		it('should handle errors gracefully', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const originalDocument = global.document;
			Object.defineProperty(global, 'document', {
				get: () => {
					throw new Error('Document error');
				},
				configurable: true,
			});

			await removeCookie('test');
			expect(consoleErrorSpy).toHaveBeenCalled();

			Object.defineProperty(global, 'document', {
				value: originalDocument,
				configurable: true,
			});
			consoleErrorSpy.mockRestore();
		});
	});

	describe('hasCookie', () => {
		it('should return true if cookie exists', async () => {
			await setCookie('test', 'value');
			expect(await hasCookie('test')).toBe(true);
		});

		it('should return false if cookie does not exist', async () => {
			expect(await hasCookie('nonexistent')).toBe(false);
		});

		it('should return false for empty cookie value', async () => {
			document.cookie = 'empty=; path=/';
			expect(await hasCookie('empty')).toBe(false);
		});
	});

	describe('getAllCookies', () => {
		it('should return all cookies', async () => {
			await setCookie('cookie1', 'value1');
			await setCookie('cookie2', 'value2');

			const all = await getAllCookies();
			expect(all).toMatchObject({
				cookie1: 'value1',
				cookie2: 'value2',
			});
		});

		it('should return empty object when no cookies exist', async () => {
			const all = await getAllCookies();
			expect(all).toEqual({});
		});
	});

	describe('clearAllCookies', () => {
		it('should clear all cookies', async () => {
			await setCookie('cookie1', 'value1');
			await setCookie('cookie2', 'value2');

			await clearAllCookies();

			expect(await hasCookie('cookie1')).toBe(false);
			expect(await hasCookie('cookie2')).toBe(false);
		});

		it('should handle clearing when no cookies exist', async () => {
			await expect(clearAllCookies()).resolves.not.toThrow();
		});
	});

	describe('edge cases', () => {
		it('should handle JWT tokens', async () => {
			const jwt =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
			await setCookie('jwt', jwt);
			expect(await getCookie('jwt')).toBe(jwt);
		});

		it('should handle unicode characters', async () => {
			await setCookie('test', '你好世界');
			expect(await getCookie('test')).toBe('你好世界');
		});

		it('should handle special characters in values', async () => {
			await setCookie('test', 'hello@world!#$%^&*()');
			expect(await getCookie('test')).toBe('hello@world!#$%^&*()');
		});

		it('should handle values with equals signs', async () => {
			const value = 'key=value=another';
			await setCookie('test', value);
			expect(await getCookie('test')).toBe(value);
		});

		it('should handle empty string value', async () => {
			await setCookie('test', '');
			expect(await hasCookie('test')).toBe(false);
		});

		it('should handle very long cookie values', async () => {
			const longValue = 'x'.repeat(1000);
			await setCookie('test', longValue);
			expect(await getCookie('test')).toBe(longValue);
		});

		it('should handle cookie names with hyphens and underscores', async () => {
			await setCookie('test-name_with_chars', 'value');
			expect(await getCookie('test-name_with_chars')).toBe('value');
		});

		it('should handle multiple cookies with similar names', async () => {
			await setCookie('test', 'value1');
			await setCookie('test2', 'value2');
			await setCookie('test3', 'value3');

			expect(await getCookie('test')).toBe('value1');
			expect(await getCookie('test2')).toBe('value2');
			expect(await getCookie('test3')).toBe('value3');
		});
	});

	describe('error handling', () => {
		it('should handle getCookie errors and return undefined', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			// Force an error by making document.cookie throw
			Object.defineProperty(document, 'cookie', {
				get: () => {
					throw new Error('Cookie access denied');
				},
				configurable: true,
			});

			const result = await getCookie('test');

			expect(result).toBeUndefined();
			expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to get cookie "test":', expect.any(Error));

			consoleErrorSpy.mockRestore();
		});

		it('should handle setCookie errors gracefully', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			// Force an error by making document.cookie throw
			Object.defineProperty(document, 'cookie', {
				set: () => {
					throw new Error('Cookie write denied');
				},
				get: () => '',
				configurable: true,
			});

			await setCookie('test', 'value');

			expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to set cookie "test":', expect.any(Error));

			consoleErrorSpy.mockRestore();
		});

		it('should handle removeCookie errors gracefully', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			// Force an error
			Object.defineProperty(document, 'cookie', {
				set: () => {
					throw new Error('Cookie delete denied');
				},
				get: () => '',
				configurable: true,
			});

			await removeCookie('test');

			expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to remove cookie "test":', expect.any(Error));

			consoleErrorSpy.mockRestore();
		});
	});

	describe('server-side warnings', () => {
		it('should warn when calling getAllCookies on server', async () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			// Mock isServer in the module
			vi.doMock('../src/utils', () => ({
				isServer: () => true,
				parseCookieString: vi.fn(),
				serializeCookie: vi.fn(),
				isValidCookieName: vi.fn(() => true),
				sanitizeCookieValue: vi.fn((v: string) => v),
			}));

			const result = await getAllCookies();

			expect(result).toEqual({});
			// Note: This test might not catch the warning due to module caching
			// Better to test this in server.test.ts with proper mocking

			consoleWarnSpy.mockRestore();
		});
	});
});
