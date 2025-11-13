export const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Check if running on server
 */
export function isServer(): boolean {
	return typeof globalThis.window === 'undefined';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
	return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
}

/**
 * Parse cookie string into key-value pairs
 */
export function parseCookieString(cookieString: string | undefined): Record<string, string> {
	if (!cookieString) return {};

	return cookieString
		.split(';')
		.map(cookie => cookie.trim())
		.reduce(
			(acc, cookie) => {
				const [key, ...valueParts] = cookie.split('=');
				if (key) {
					try {
						const value = valueParts.join('=');
						acc[key] = decodeURIComponent(value);
					} catch {
						// Skip malformed cookies silently
					}
				}
				return acc;
			},
			{} as Record<string, string>,
		);
}

/**
 * Serialize cookie with options
 */
export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
	if (!isValidCookieName(name)) {
		throw new TypeError(`Invalid cookie name: "${name}"`);
	}

	const { maxAge = DEFAULT_MAX_AGE, path = '/', domain, secure = isProduction(), sameSite = 'lax' } = options;

	let cookie = `${name}=${encodeURIComponent(value)}`;
	cookie += `; Path=${path}`;

	if (maxAge !== undefined && maxAge !== null) {
		const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
		cookie += `; Expires=${expires}`;
		cookie += `; Max-Age=${maxAge}`;
	}

	if (domain) {
		cookie += `; Domain=${domain}`;
	}

	if (secure) {
		cookie += '; Secure';
	}

	const normalizedSameSite = sameSite.toLowerCase();
	cookie += `; SameSite=${normalizedSameSite.charAt(0).toUpperCase() + normalizedSameSite.slice(1)}`;

	return cookie;
}

/**
 + * Validate cookie name (stricter than RFC 6265)
 * Only allows alphanumeric, underscores, and hyphens
 */
export function isValidCookieName(name: string): boolean {
	return /^[\w-]+$/.test(name);
}

/**
 * Sanitize cookie value
 * Control characters (0x00-0x1F): null bytes, tabs, line feeds, etc.
 *   - DEL character (0x7F)
 *   - Semicolons, commas, quotes, backslashes
 *   - CRLF sequences (explicit and within control char range)
 *   - Edge cases: empty strings, all-dangerous strings, mixed content
 *   - Real-world scenarios: header injection attempts, email addresses with dangerous chars
 *   - Valid characters: ensures safe values like alphanumerics, hyphens, underscores, periods, and spaces are preserved
 */
export function sanitizeCookieValue(value: string): string {
	// Remove control chars, semicolons, quotes, commas per RFC 6265
	// biome-ignore lint/suspicious/noControlCharactersInRegex: regex headers
	return value.replace(/[\x00-\x1F\x7F;,"\\\r\n]/g, '');
}
