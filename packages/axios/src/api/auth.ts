import type { LoginRequestSchema, LoginResponseSchema } from '@workspace/schema';
import type { AxiosResponse } from 'axios';
import type { HttpClient } from './http';

export class AuthApi {
	constructor(private readonly httpClient: HttpClient) {}

	signIn = async (data: LoginRequestSchema): Promise<AxiosResponse<LoginResponseSchema>> => {
		return await this.httpClient.post<LoginResponseSchema>('/auth/sign-in', { data });
	};
}
