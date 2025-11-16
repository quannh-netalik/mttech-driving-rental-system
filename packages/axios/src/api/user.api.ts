import type { HttpClient } from '@workspace/axios/index';
import type { ProfileSchema } from '@workspace/schema';
import pino from 'pino';

export class UserApi {
	private readonly logger = pino({
		msgPrefix: '[UserApi] ',
	});

	private readonly controller: UrlPath = '/users';

	constructor(private readonly httpClient: HttpClient) {}

	profile = async (): Promise<ProfileSchema> => {
		this.logger.info('Fetching user profile...');
		const user = await this.httpClient.get<ProfileSchema>(this.controller, '/profile');
		this.logger.info('Profile fetched successfully');
		return user;
	};
}
