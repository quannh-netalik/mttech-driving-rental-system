import { createServerFn } from '@tanstack/react-start';

export const $getUser = createServerFn({ method: 'GET' }).handler(async () => {
	// const session = await auth.api.getSession({ headers: getRequest().headers });

	// return session?.user || null;
	return null;
});
