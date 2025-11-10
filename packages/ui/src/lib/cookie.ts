/**
 * Cookie utility functions using manual document.cookie approach
 * Replaces js-cookie dependency for better consistency
 */

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Get a cookie value by name (uses cookieStore if available)
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
 * Set a cookie using the modern Cookie Store API
 */
export async function setCookie(name: string, value: string, maxAge: number = DEFAULT_MAX_AGE): Promise<void> {
	if (typeof cookieStore === 'undefined') return; // not supported in older browsers

	await cookieStore.set({
		name,
		value,
		path: '/',
		expires: Date.now() + maxAge * 1000, // expires takes a timestamp (ms)
	});
}

/**
 * Remove a cookie by deleting it
 */
export async function removeCookie(name: string): Promise<void> {
	if (typeof cookieStore === 'undefined') return;

	await cookieStore.delete(name);
}
