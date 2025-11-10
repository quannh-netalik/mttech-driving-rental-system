import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/auth/$')({
	server: {
		handlers: {
			GET: ({ request }) => {
				return {} as any;
			},
			POST: ({ request }) => {
				return {} as any;
			},
		},
	},
});
