/**
 * Local storage keys used throughout the application
 */
export const StorageKeys = {
	ACCESS_TOKEN: 'access_token',
	REFRESH_TOKEN: 'refresh_token',
} as const;

/**
 * Type-safe wrapper for localStorage operations with error handling
 */
export class LocalStorageService {
	private isLocalStorageAvailable(): boolean {
		try {
			return typeof globalThis.window !== 'undefined' && typeof globalThis.window.localStorage !== 'undefined';
		} catch {
			return false;
		}
	}

	/**
	 * Safely retrieves an item from localStorage
	 * @param key - The storage key to retrieve
	 * @returns The stored value or null if not found or on error
	 */
	public getItem(key: string): string | null {
		try {
			if (!this.isLocalStorageAvailable()) {
				console.warn('localStorage is not available');
				return null;
			}
			return globalThis.window.localStorage.getItem(key);
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
	public setItem(key: string, value: string): void {
		try {
			if (!this.isLocalStorageAvailable()) {
				console.warn('localStorage is not available');
				return;
			}
			globalThis.window.localStorage.setItem(key, value);
		} catch (error) {
			console.error(`Error writing to localStorage (key: ${key}):`, error);
		}
	}

	/**
	 * Safely removes an item from localStorage
	 * @param key - The storage key to remove
	 */
	public removeItem(key: string): void {
		try {
			if (!this.isLocalStorageAvailable()) {
				console.warn('localStorage is not available');
				return;
			}
			globalThis.window.localStorage.removeItem(key);
		} catch (error) {
			console.error(`Error removing from localStorage (key: ${key}):`, error);
		}
	}

	/**
	 * Clears all localStorage keys (use carefully)
	 */
	public clearAll(): void {
		try {
			if (!this.isLocalStorageAvailable()) return;
			globalThis.window.localStorage.clear();
		} catch (error) {
			console.error('Error clearing localStorage:', error);
		}
	}
}

/**
 * Singleton instance for direct usage
 */
export const localStorageService = new LocalStorageService();
