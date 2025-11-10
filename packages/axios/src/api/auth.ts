import type { HttpClient } from './http';

export class AuthApi {
	constructor(private readonly httpClient: HttpClient) {}

	signIn = async (data: { email: string; password: string }): Promise<void> => {
		await this.httpClient.post<void>('/auth/sign-in', { data });
	};
}
