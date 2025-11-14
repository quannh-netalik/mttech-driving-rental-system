/**
 * Standardized cookie token identifiers used across the application.
 * Use these constants to ensure consistent cookie naming.
 *
 * @example
 * ```ts
 * import { COOKIE_TOKENS } from '@workspace/axios/token';
 *
 * const token = cookies.get(COOKIE_TOKENS.ACCESS_TOKEN);
 * ```
 */
export const COOKIE_TOKENS = {
	ACCESS_TOKEN: 'access_token',
	REFRESH_TOKEN: 'refresh_token',
	SESSION_ID: 'session_id',
} as const;

/**
 * Union type of all valid cookie token values.
 * Useful for type-safe cookie operations.
 */
export type CookieToken = (typeof COOKIE_TOKENS)[keyof typeof COOKIE_TOKENS];
