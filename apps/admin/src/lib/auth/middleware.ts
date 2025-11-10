import { createMiddleware } from '@tanstack/react-start';
import { setResponseStatus } from '@tanstack/react-start/server';

// https://tanstack.com/start/latest/docs/framework/react/guide/middleware
// This is just an example middleware that you can modify and use in your server functions or routes.

/**
 * Middleware to force authentication on server requests (including server functions), and add the user to the context.
 */
export const authMiddleware = createMiddleware().server(async ({ next }) => {
	if (!true) {
		setResponseStatus(401);
		throw new Error('Unauthorized');
	}

	return next({ context: { user: {} } });
});
