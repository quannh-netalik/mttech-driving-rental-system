/**
 * Local storage keys used throughout the application
 */
const StorageKeys = {
	ACCESS_TOKEN: 'access_token',
	REFRESH_TOKEN: 'refresh_token',
} as const;

/**
 * Type-safe wrapper for localStorage operations with error handling
 */
class LocalStorageService {
	private isLocalStorageAvailable(): boolean {
		try {
			return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
		} catch {
			return false;
		}
	}

	/**
	 * Safely retrieves an item from localStorage
	 * @param key - The storage key to retrieve
	 * @returns The stored value or null if not found or on error
	 */
	private getItem(key: string): string | null {
		try {
			if (!this.isLocalStorageAvailable()) {
				console.warn('localStorage is not available');
				return null;
			}

			return localStorage.getItem(key);
		} catch (error) {
			console.error(`Error reading from localStorage (key: ${key}):`, error);
			return null;
		}
	}

	/**
	 * Safely sets an item in localStorage
	 * @param key - The storage key
	 * @param value - The value to store
	 */
	private setItem(key: string, value: string): void {
		try {
			localStorage.setItem(key, value);
		} catch (error) {
			console.error(`Error writing to localStorage (key: ${key}):`, error);
		}
	}

	/**
	 * Safely removes an item from localStorage
	 * @param key - The storage key to remove
	 */
	private removeItem(key: string): void {
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.error(`Error removing from localStorage (key: ${key}):`, error);
		}
	}

	// Access Token Operations
	/**
	 * Retrieves the access token from localStorage
	 * @returns The access token or null if not found
	 */
	public getAccessToken(): string | null {
		return this.getItem(StorageKeys.ACCESS_TOKEN);
	}

	/**
	 * Stores the access token in localStorage
	 * @param token - The access token to store
	 */
	public setAccessToken(token: string): void {
		if (!token) {
			console.warn('Attempted to set empty access token');
			return;
		}
		this.setItem(StorageKeys.ACCESS_TOKEN, token);
	}

	/**
	 * Removes the access token from localStorage
	 */
	public clearAccessToken(): void {
		this.removeItem(StorageKeys.ACCESS_TOKEN);
	}

	// Refresh Token Operations
	/**
	 * Retrieves the refresh token from localStorage
	 * @returns The refresh token or null if not found
	 */
	public getRefreshToken(): string | null {
		return this.getItem(StorageKeys.REFRESH_TOKEN);
	}

	/**
	 * Stores the refresh token in localStorage
	 * @param token - The refresh token to store
	 */
	public setRefreshToken(token: string): void {
		if (!token) {
			console.warn('Attempted to set empty refresh token');
			return;
		}
		this.setItem(StorageKeys.REFRESH_TOKEN, token);
	}

	/**
	 * Removes the refresh token from localStorage
	 */
	public clearRefreshToken(): void {
		this.removeItem(StorageKeys.REFRESH_TOKEN);
	}

	// Utility Operations
	/**
	 * Clears all authentication tokens from localStorage
	 */
	public clearAuth(): void {
		this.clearAccessToken();
		this.clearRefreshToken();
	}

	/**
	 * Checks if the user has valid authentication tokens
	 * @returns True if both access and refresh tokens exist
	 */
	public hasValidAuth(): boolean {
		return Boolean(this.getAccessToken() && this.getRefreshToken());
	}

	/**
	 * Sets both access and refresh tokens
	 * @param accessToken - The access token to store
	 * @param refreshToken - The refresh token to store
	 */
	public setAuthTokens(accessToken: string, refreshToken: string): void {
		this.setAccessToken(accessToken);
		this.setRefreshToken(refreshToken);
	}
}

/**
 * Singleton instance of LocalStorageService
 * Provides centralized access to localStorage operations throughout the application
 */
export const localStorageServices = new LocalStorageService();

/**
 * Export storage keys for testing purposes
 * @internal
 */
export const __StorageKeys__ = StorageKeys;
