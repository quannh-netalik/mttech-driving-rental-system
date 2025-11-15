import type { HttpClient } from '@workspace/axios/index';
import type { ProfileSchema } from '@workspace/schema';
import pino from 'pino';

export interface TokenValidationResult {
	isValid: boolean;
	user?: ProfileSchema;
}

export class UserApi {
	private readonly logger = pino({
		msgPrefix: '[UserApi] ',
	});

	private readonly controller: UrlPath = '/users';

	constructor(private readonly httpClient: HttpClient) {}

	profile = async (): Promise<ProfileSchema> => {
		this.logger.info('Validating session...');
		const user = await this.httpClient.get<ProfileSchema>(this.controller, '/profile');
		this.logger.info('Validating done');
		return user;
	};
}
