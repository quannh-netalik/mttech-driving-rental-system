# @workspace/cookie

Simple, lightweight cookie store for TanStack Start with Vinxi. Works seamlessly on both client and server (SSR).

## Installation

```bash
npm install @workspace/cookie vinxi
```

## Usage

```typescript
import { getCookie, setCookie, removeCookie, hasCookie } from '@workspace/cookie';

// Set a cookie
await setCookie('access_token', 'your-jwt-token', {
  maxAge: 7 * 24 * 60 * 60, // 7 days
  sameSite: 'lax',
  secure: true,
});

// Get a cookie (works on both client and server!)
const token = await getCookie('access_token');

// Check if cookie exists
const isAuthenticated = await hasCookie('access_token');

// Remove a cookie
await removeCookie('access_token');
```

## API

### `getCookie(name: string): Promise<string | undefined>`

Get cookie value by name. Works on both client and server.

### `setCookie(name: string, value: string, options?: CookieOptions): Promise<void>`

Set a cookie with optional configuration.

**Options:**

- `maxAge`: Expiration in seconds (default: 7 days)
- `path`: Cookie path (default: '/')
- `domain`: Cookie domain
- `secure`: HTTPS only (default: true in production)
- `sameSite`: 'strict' | 'lax' | 'none' (default: 'lax')

### `removeCookie(name: string, options?): Promise<void>`

Remove a cookie.

### `hasCookie(name: string): Promise<boolean>`

Check if a cookie exists.

### `getAllCookies(): Promise<Record<string, string>>`

Get all cookies (client-side only).

### `clearAllCookies(): Promise<void>`

Clear all cookies (client-side only).

## License

MIT
