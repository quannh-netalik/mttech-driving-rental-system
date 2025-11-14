import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { apiClients } from './api.client';

export const USER_PROFILE = 'USER_PROFILE';

export const getUserProfileOptions = () => {
	return queryOptions({
		queryKey: [USER_PROFILE],
		queryFn: () => getUserProfile(),
		placeholderData: keepPreviousData,
	});
};

export const getUserProfile = createServerFn({ method: 'GET' }).handler(async () => {
	return await apiClients.user.profile();
});
