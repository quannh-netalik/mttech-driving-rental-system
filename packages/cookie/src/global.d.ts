export declare global {
	interface CookieOptions {
		/**
		 * Cookie expiration time in seconds
		 * @default 604800 (7 days)
		 */
		maxAge?: number;

		/**
		 * Cookie path
		 * @default '/'
		 */
		path?: string;

		/**
		 * Cookie domain
		 */
		domain?: string;

		/**
		 * Whether the cookie should only be sent over HTTPS
		 * @default true in production
		 */
		secure?: boolean;

		/**
		 * SameSite attribute
		 * @default 'lax'
		 */
		sameSite?: 'strict' | 'lax' | 'none';
	}
}
