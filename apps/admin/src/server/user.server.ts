import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { createServerApiClients } from './api.client';

export const USER_PROFILE = 'USER_PROFILE';

// Export stable query key for direct use
export const userProfileQueryKey = [USER_PROFILE] as const;

export const getUserProfileOptions = () => {
	return queryOptions({
		queryKey: userProfileQueryKey,
		queryFn: () => getUserProfile(),
		placeholderData: keepPreviousData,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 30, // 30 minutes
	});
};

export const getUserProfile = createServerFn({ method: 'GET' }).handler(async () => {
	const apiClients = createServerApiClients();
	return await apiClients.user.profile();
});
