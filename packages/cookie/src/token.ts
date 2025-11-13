export const COOKIE_TOKENS = {
	ACCESS_TOKEN: 'access_token',
	REFRESH_TOKEN: 'refresh_token',
	SESSION_ID: 'session_id',
} as const;

export type CookieToken = (typeof COOKIE_TOKENS)[keyof typeof COOKIE_TOKENS];
