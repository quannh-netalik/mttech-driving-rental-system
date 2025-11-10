import { type LocalStorageService, localStorageService, StorageKeys } from './local.storage';

/**
 * Authentication store layer built on top of LocalStorageService
 */
class AuthStoreService {
	constructor(private readonly storage: LocalStorageService) {}

	// Access Token Operations
	public getAccessToken(): string | null {
		return this.storage.getItem(StorageKeys.ACCESS_TOKEN);
	}

	public setAccessToken(token: string): void {
		if (!token) {
			console.warn('Attempted to set empty access token');
			return;
		}
		this.storage.setItem(StorageKeys.ACCESS_TOKEN, token);
	}

	public clearAccessToken(): void {
		this.storage.removeItem(StorageKeys.ACCESS_TOKEN);
	}

	// Refresh Token Operations
	public getRefreshToken(): string | null {
		return this.storage.getItem(StorageKeys.REFRESH_TOKEN);
	}

	public setRefreshToken(token: string): void {
		if (!token) {
			console.warn('Attempted to set empty refresh token');
			return;
		}
		this.storage.setItem(StorageKeys.REFRESH_TOKEN, token);
	}

	public clearRefreshToken(): void {
		this.storage.removeItem(StorageKeys.REFRESH_TOKEN);
	}

	// Utility Operations
	public clearAuth(): void {
		this.clearAccessToken();
		this.clearRefreshToken();
	}

	public hasValidAuth(): boolean {
		return Boolean(this.getAccessToken() && this.getRefreshToken());
	}

	public setAuthTokens(accessToken: string, refreshToken: string): void {
		this.setAccessToken(accessToken);
		this.setRefreshToken(refreshToken);
	}
}

/**
 * Singleton instance for auth-specific storage logic
 */
export const authStoreService = new AuthStoreService(localStorageService);
