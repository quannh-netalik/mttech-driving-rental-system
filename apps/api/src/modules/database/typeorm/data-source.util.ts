export interface ConfigGetter {
	get(key: string): string | undefined;
	getOrThrow<T = string>(key: string): T;
}

export class EnvConfigGetter implements ConfigGetter {
	get(key: string): string | undefined {
		return process.env[key];
	}

	getOrThrow<T = string>(key: string): T {
		const value = process.env[key];
		if (!value) {
			throw new Error(`Missing required environment variable: ${key}`);
		}
		return (key.includes('PORT') ? Number(value) : value) as T;
	}
}
