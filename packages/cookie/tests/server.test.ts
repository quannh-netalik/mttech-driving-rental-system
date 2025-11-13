import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Server-side Cookie Store', () => {
	let originalWindow: typeof globalThis.window;

	beforeEach(() => {
		// Save original window
		originalWindow = globalThis.window;

		// Remove window to simulate server environment
		// @ts-expect-error
		delete globalThis.window;
	});

	afterEach(() => {
		// Restore window
		globalThis.window = originalWindow;
		vi.resetModules();
	});

	describe('getCookie on server', () => {
		it('should use vinxi getCookie on server', async () => {
			const mockGetCookie = vi.fn().mockReturnValue('server-value');

			vi.doMock('vinxi/http', () => ({
				getCookie: mockGetCookie,
			}));

			const { getCookie } = await import('../src/index');
			const result = await getCookie('test');

			expect(mockGetCookie).toHaveBeenCalledWith('test');
			expect(result).toBe('server-value');
		});

		it('should handle vinxi import errors', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			vi.doMock('vinxi/http', () => {
				throw new Error('Vinxi not available');
			});

			const { getCookie } = await import('../src/index');
			const result = await getCookie('test');

			expect(result).toBeUndefined();
			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});
	});

	describe('setCookie on server', () => {
		it('should use vinxi setCookie on server', async () => {
			const mockSetCookie = vi.fn();

			vi.doMock('vinxi/http', () => ({
				setCookie: mockSetCookie,
			}));

			const { setCookie } = await import('../src/index');
			await setCookie('test', 'value', { maxAge: 3600 });

			expect(mockSetCookie).toHaveBeenCalledWith('test', 'value', { maxAge: 3600 });
		});

		it('should handle vinxi errors gracefully', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			vi.doMock('vinxi/http', () => ({
				setCookie: () => {
					throw new Error('Vinxi error');
				},
			}));

			const { setCookie } = await import('../src/index');
			await setCookie('test', 'value');

			expect(consoleErrorSpy).toHaveBeenCalled();
			consoleErrorSpy.mockRestore();
		});
	});

	describe('removeCookie on server', () => {
		it('should use vinxi deleteCookie on server', async () => {
			const mockDeleteCookie = vi.fn();

			vi.doMock('vinxi/http', () => ({
				deleteCookie: mockDeleteCookie,
			}));

			const { removeCookie } = await import('../src/index');
			await removeCookie('test');

			expect(mockDeleteCookie).toHaveBeenCalledWith('test');
		});

		it('should handle vinxi errors gracefully', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			vi.doMock('vinxi/http', () => ({
				deleteCookie: () => {
					throw new Error('Vinxi error');
				},
			}));

			const { removeCookie } = await import('../src/index');
			await removeCookie('test');

			expect(consoleErrorSpy).toHaveBeenCalled();
			consoleErrorSpy.mockRestore();
		});
	});

	describe('getAllCookies on server', () => {
		it('should return empty object and warn on server', async () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const { getAllCookies } = await import('../src/index');
			const result = await getAllCookies();

			expect(result).toEqual({});
			expect(consoleWarnSpy).toHaveBeenCalledWith('getAllCookies() is not supported on server-side');

			consoleWarnSpy.mockRestore();
		});
	});

	describe('clearAllCookies on server', () => {
		it('should warn and do nothing on server', async () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const { clearAllCookies } = await import('../src/index');
			await clearAllCookies();

			expect(consoleWarnSpy).toHaveBeenCalledWith('clearAllCookies() is not supported on server-side');

			consoleWarnSpy.mockRestore();
		});
	});
});
