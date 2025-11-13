import { isServer, isValidCookieName, parseCookieString, sanitizeCookieValue, serializeCookie } from './utils';

export * from './token';

/**
 * Get cookie value by name (works on client and server)
 */
export async function getCookie(name: string): Promise<string | undefined> {
	if (!isValidCookieName(name)) {
		throw new Error(`Invalid cookie name: ${name}`);
	}

	try {
		// Server-side: use vinxi/http
		if (isServer()) {
			const { getCookie: getVinxiCookie } = await import('vinxi/http');
			return getVinxiCookie(name);
		}

		// Client-side: use document.cookie
		const cookies = parseCookieString(globalThis.document.cookie);
		return cookies[name];
	} catch (error) {
		console.error(`Failed to get cookie "${name}":`, error);
		return undefined;
	}
}

/**
 * Set cookie (works on client and server)
 */
export async function setCookie(name: string, value: string, options?: CookieOptions): Promise<void> {
	if (!isValidCookieName(name)) {
		throw new Error(`Invalid cookie name: ${name}`);
	}

	try {
		const sanitizedValue = sanitizeCookieValue(value);

		// Server-side: use vinxi/http
		if (isServer()) {
			const { setCookie: setVinxiCookie } = await import('vinxi/http');
			setVinxiCookie(name, sanitizedValue, options || {});
			return;
		}

		// Client-side: use document.cookie
		const cookieString = serializeCookie(name, sanitizedValue, options);
		// biome-ignore lint/suspicious/noDocumentCookie: Direct cookie manipulation
		globalThis.document.cookie = cookieString;
	} catch (error) {
		console.error(`Failed to set cookie "${name}":`, error);
	}
}

/**
 * Remove cookie (works on client and server)
 */
export async function removeCookie(name: string, options?: Pick<CookieOptions, 'path' | 'domain'>): Promise<void> {
	if (!isValidCookieName(name)) {
		throw new Error(`Invalid cookie name: ${name}`);
	}

	try {
		// Server-side: use vinxi/http
		if (isServer()) {
			const { deleteCookie } = await import('vinxi/http');
			deleteCookie(name);
			return;
		}

		// Client-side: expire the cookie
		const { path = '/', domain } = options || {};
		let cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

		if (domain) {
			cookie += `; Domain=${domain}`;
		}

		// biome-ignore lint/suspicious/noDocumentCookie: Direct cookie manipulation
		globalThis.document.cookie = cookie;
	} catch (error) {
		console.error(`Failed to remove cookie "${name}":`, error);
	}
}

/**
 * Check if cookie exists
 */
export async function hasCookie(name: string): Promise<boolean> {
	const value = await getCookie(name);
	return value !== undefined && value !== '';
}

/**
 * Get all cookies (client-side only)
 */
export async function getAllCookies(): Promise<Record<string, string>> {
	if (isServer()) {
		console.warn('getAllCookies() is not supported on server-side');
		return {};
	}

	return parseCookieString(globalThis.document.cookie);
}

/**
 * Clear all cookies (client-side only)
 */
export async function clearAllCookies(): Promise<void> {
	if (isServer()) {
		console.warn('clearAllCookies() is not supported on server-side');
		return;
	}

	const cookies = await getAllCookies();

	for (const name of Object.keys(cookies)) {
		await removeCookie(name);
	}
}
