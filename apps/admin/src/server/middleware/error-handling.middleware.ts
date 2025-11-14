import { createMiddleware, json } from '@tanstack/react-start';
import axios from 'axios';

export const errorHandler = createMiddleware().server(async ({ next }) => {
	try {
		return await next();
	} catch (error) {
		if (!axios.isAxiosError(error)) throw error;

		const status = error.response?.status || 500;
		const statusText = error.response?.statusText || 'Internal error';
		const message = error.response?.data?.message || 'Internal server error';

		throw json({ message }, { status, statusText });
	}
});
