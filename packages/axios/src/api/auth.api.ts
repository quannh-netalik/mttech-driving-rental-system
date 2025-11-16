import type { HttpClient } from '@workspace/axios/index';
import type { LoginRequestSchema, LoginResponseSchema } from '@workspace/schema';

export class AuthApi {
	private readonly controller: UrlPath = '/auth';

	constructor(private readonly httpClient: HttpClient) {}

	signIn = async (data: LoginRequestSchema): Promise<LoginResponseSchema> => {
		return await this.httpClient.post<LoginResponseSchema>(this.controller, '/sign-in', { data });
	};
}
