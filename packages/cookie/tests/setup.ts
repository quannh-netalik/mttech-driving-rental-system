import { afterEach, beforeEach } from 'vitest';

// Proper in-memory cookie store for testing
const cookieJar = new Map<string, string>();

beforeEach(() => {
	cookieJar.clear();

	// Override document.cookie with proper implementation
	Object.defineProperty(document, 'cookie', {
		get() {
			// Return all cookies as a single string
			const cookies = Array.from(cookieJar.entries())
				.map(([name, value]) => `${name}=${value}`)
				.join('; ');
			return cookies;
		},
		set(cookieString: string) {
			// Parse and store the cookie
			const [nameValue] = cookieString.split(';');
			if (!nameValue) return;

			const [name, ...valueParts] = nameValue.split('=');
			const value = valueParts.join('=').trim();

			if (!name) return;

			// Check if this is a deletion (expired date or empty value)
			const isDeleting = cookieString.includes('Expires=Thu, 01 Jan 1970') || value === '';

			if (isDeleting) {
				cookieJar.delete(name.trim());
			} else {
				cookieJar.set(name.trim(), value);
			}
		},
		configurable: true,
	});
});

afterEach(() => {
	cookieJar.clear();
});
