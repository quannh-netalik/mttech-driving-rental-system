import { InjectionToken, Provider } from '@nestjs/common';

export const extractProviderToken = (provider: Provider): InjectionToken => {
	if (typeof provider === 'object' && provider !== null && 'provide' in provider) {
		return provider.provide;
	}

	return provider as InjectionToken;
};
