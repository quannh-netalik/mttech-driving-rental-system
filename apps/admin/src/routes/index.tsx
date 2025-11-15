import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
	beforeLoad: async ({ context }) => {
		console.log({ context });
		throw redirect({ to: context.user ? '/dashboard' : '/login' });
	},
});
