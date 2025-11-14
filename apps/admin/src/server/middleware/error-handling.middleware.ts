import { createMiddleware, json } from '@tanstack/react-start';
import axios from 'axios';

export const errorHandler = createMiddleware().server(async ({ next }) => {
	try {
		return await next();
	} catch (error) {
		console.error('[Error Handler]', {
			error,
			stack: error instanceof Error ? error.stack : undefined,
			isAxiosError: axios.isAxiosError(error),
		});

		if (!axios.isAxiosError(error)) throw error;

		const status = error.response?.status || 500;
		const statusText = error.response?.statusText || 'Internal error';
		// Sanitize error messages - only expose safe messages for client errors (4xx)
		const message =
			status >= 400 && status < 500 ? error.response?.data?.message || 'Bad request' : 'Internal server error';

		throw json({ message }, { status, statusText });
	}
});
