/**
 * Cookie utility functions using manual document.cookie approach
 * Replaces js-cookie dependency for better consistency
 */

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Retrieve the value of a cookie by name.
 *
 * @returns The cookie value if found, or `undefined` when not in a browser environment or when the cookie does not exist.
 */
export async function getCookie(name: string): Promise<string | undefined> {
	// If running in a non-browser environment
	if (typeof document === 'undefined' && typeof cookieStore === 'undefined') {
		return undefined;
	}

	// Modern API
	if (typeof cookieStore !== 'undefined') {
		const cookie = await cookieStore.get(name);
		return cookie?.value;
	}

	// Fallback: traditional parsing
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop()?.split(';').shift();
	}

	return undefined;
}

/**
 * Sets a cookie with the given name and value.
 *
 * Uses the Cookie Store API when available; otherwise falls back to writing to `document.cookie`.
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param maxAge - Lifetime of the cookie in seconds; defaults to `DEFAULT_MAX_AGE` (7 days)
 */
export async function setCookie(name: string, value: string, maxAge: number = DEFAULT_MAX_AGE): Promise<void> {
	// Modern API
	if (typeof cookieStore !== 'undefined') {
		await cookieStore.set({
			name,
			value,
			path: '/',
			sameSite: 'lax',
			expires: Date.now() + maxAge * 1000,
		});
		return;
	}

	if (typeof document !== 'undefined') {
		const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
		const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
		// biome-ignore lint/suspicious/noDocumentCookie: Fallback: traditional document.cookie
		document.cookie = `${name}=${value}; path=/; SameSite=Lax${secureFlag}; expires=${expires}`;
	}
}

/**
 * Remove the cookie with the given name.
 *
 * Uses the Cookie Store API when available; otherwise expires the cookie via document.cookie.
 * Does nothing when not running in a browser environment.
 *
 * @param name - The cookie name to remove
 */
export async function removeCookie(name: string): Promise<void> {
	// Modern API
	if (typeof cookieStore !== 'undefined') {
		await cookieStore.delete(name);
		return;
	}

	if (typeof document !== 'undefined') {
		// biome-ignore lint/suspicious/noDocumentCookie: Fallback: expire the cookie immediately
		document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
	}
}