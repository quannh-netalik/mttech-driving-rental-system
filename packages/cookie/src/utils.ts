export const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Check if running on server
 */
export function isServer(): boolean {
	return typeof window === 'undefined';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
	return process.env.NODE_ENV === 'production';
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
					const value = valueParts.join('=');
					acc[key] = decodeURIComponent(value);
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
	const { maxAge = DEFAULT_MAX_AGE, path = '/', domain, secure = isProduction(), sameSite = 'lax' } = options;

	let cookie = `${name}=${encodeURIComponent(value)}`;
	cookie += `; Path=${path}`;

	if (maxAge) {
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

	cookie += `; SameSite=${sameSite.charAt(0).toUpperCase() + sameSite.slice(1)}`;

	return cookie;
}

/**
 * Validate cookie name
 */
export function isValidCookieName(name: string): boolean {
	return /^[\w-]+$/.test(name);
}

/**
 * Sanitize cookie value
 */
export function sanitizeCookieValue(value: string): string {
	return value.replace(/[;\r\n]/g, '');
}
