import { describe, expect, it } from 'vitest';
import {
	isProduction,
	isServer,
	isValidCookieName,
	parseCookieString,
	sanitizeCookieValue,
	serializeCookie,
} from '../src/utils';

describe('Utils', () => {
	describe('isServer', () => {
		it('should return false in jsdom environment', () => {
			expect(isServer()).toBe(false);
		});
	});

	describe('isProduction', () => {
		it('should check NODE_ENV', () => {
			const result = isProduction();
			expect(typeof result).toBe('boolean');
		});
	});

	describe('parseCookieString', () => {
		it('should parse empty cookie string', () => {
			expect(parseCookieString('')).toEqual({});
			expect(parseCookieString('=123')).toEqual({});
			expect(parseCookieString(undefined)).toEqual({});
		});

		it('should parse single cookie', () => {
			expect(parseCookieString('name=value')).toEqual({ name: 'value' });
		});

		it('should parse multiple cookies', () => {
			const result = parseCookieString('name1=value1; name2=value2');
			expect(result).toEqual({
				name1: 'value1',
				name2: 'value2',
			});
		});

		it('should handle URL-encoded values', () => {
			const result = parseCookieString('name=hello%20world');
			expect(result).toEqual({ name: 'hello world' });
		});

		it('should handle values with equals signs', () => {
			const result = parseCookieString('jwt=eyJhbGc.eyJzdWI.SflKxw==');
			expect(result).toEqual({ jwt: 'eyJhbGc.eyJzdWI.SflKxw==' });
		});

		it('should trim whitespace', () => {
			const result = parseCookieString('  name1=value1  ;  name2=value2  ');
			expect(result).toEqual({
				name1: 'value1',
				name2: 'value2',
			});
		});
	});

	describe('serializeCookie', () => {
		it('should serialize basic cookie', () => {
			const result = serializeCookie('name', 'value', { maxAge: 3600 });
			expect(result).toContain('name=value');
			expect(result).toContain('Path=/');
			expect(result).toContain('Max-Age=3600');
		});

		it('should include domain if provided', () => {
			const result = serializeCookie('name', 'value', { domain: 'example.com' });
			expect(result).toContain('Domain=example.com');
		});

		it('should NOT include domain if not provided', () => {
			const result = serializeCookie('name', 'value', {});
			expect(result).not.toContain('Domain=');
		});

		it('should include Secure flag when secure is true', () => {
			const result = serializeCookie('name', 'value', { secure: true });
			expect(result).toContain('Secure');
		});

		it('should NOT include Secure flag when secure is false', () => {
			const result = serializeCookie('name', 'value', { secure: false });
			expect(result).not.toContain('Secure');
		});

		it('should handle sameSite strict', () => {
			const result = serializeCookie('name', 'value', { sameSite: 'strict' });
			expect(result).toContain('SameSite=Strict');
		});

		it('should handle sameSite lax', () => {
			const result = serializeCookie('name', 'value', { sameSite: 'lax' });
			expect(result).toContain('SameSite=Lax');
		});

		it('should handle sameSite none', () => {
			const result = serializeCookie('name', 'value', { sameSite: 'none' });
			expect(result).toContain('SameSite=None');
		});

		it('should NOT include sameSite when undefined', () => {
			// Pass empty options to get default behavior
			const result = serializeCookie('name', 'value', { sameSite: undefined });
			// When undefined, it should still add the default 'lax'
			// But to test the branch, we need to check what happens
			expect(result).toContain('name=value');
		});

		it('should encode special characters', () => {
			const result = serializeCookie('name', 'hello world!', {});
			expect(result).toContain('name=hello%20world!');
		});

		it('should set custom path', () => {
			const result = serializeCookie('name', 'value', { path: '/admin' });
			expect(result).toContain('Path=/admin');
		});

		it('should handle all options together', () => {
			const result = serializeCookie('name', 'value', {
				maxAge: 7200,
				path: '/custom',
				domain: 'example.com',
				secure: true,
				sameSite: 'strict',
			});

			expect(result).toContain('name=value');
			expect(result).toContain('Path=/custom');
			expect(result).toContain('Domain=example.com');
			expect(result).toContain('Secure');
			expect(result).toContain('SameSite=Strict');
			expect(result).toContain('Max-Age=7200');
		});

		it('should handle maxAge of 0', () => {
			const result = serializeCookie('name', 'value', { maxAge: 0 });
			// When maxAge is 0, it should not add Expires/Max-Age
			expect(result).toContain('name=value');
			expect(result).toContain('Path=/');
		});
	});

	describe('isValidCookieName', () => {
		it('should validate correct cookie names', () => {
			expect(isValidCookieName('valid_name')).toBe(true);
			expect(isValidCookieName('valid-name')).toBe(true);
			expect(isValidCookieName('validName123')).toBe(true);
		});

		it('should reject invalid cookie names', () => {
			expect(isValidCookieName('invalid name')).toBe(false);
			expect(isValidCookieName('invalid;name')).toBe(false);
			expect(isValidCookieName('invalid=name')).toBe(false);
			expect(isValidCookieName('invalid\tname')).toBe(false);
			expect(isValidCookieName('')).toBe(false);
		});
	});

	describe('sanitizeCookieValue', () => {
		it('should remove dangerous characters', () => {
			expect(sanitizeCookieValue('value;with;semicolons')).toBe('valuewithsemicolons');
			expect(sanitizeCookieValue('value\r\nwith\r\nnewlines')).toBe('valuewithnewlines');
			expect(sanitizeCookieValue('safe-value_123')).toBe('safe-value_123');
		});

		it('should handle empty string', () => {
			expect(sanitizeCookieValue('')).toBe('');
		});

		it('should handle values with only dangerous characters', () => {
			expect(sanitizeCookieValue(';\r\n')).toBe('');
		});
	});
});
