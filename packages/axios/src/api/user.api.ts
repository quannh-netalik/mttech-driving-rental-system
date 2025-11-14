import type { HttpClient } from '@workspace/axios/index';
import type { ProfileSchema } from '@workspace/schema/user';

export class UserApi {
	private readonly controller: UrlPath = '/users';

	constructor(private readonly httpClient: HttpClient) {}

	profile = async (): Promise<ProfileSchema> => {
		return await this.httpClient.get<ProfileSchema>(this.controller, '/profile');
	};
}
