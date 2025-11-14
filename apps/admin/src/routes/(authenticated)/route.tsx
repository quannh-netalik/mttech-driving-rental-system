import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)')({
	beforeLoad: async ({ context }) => {
		if (!context.user) {
			throw redirect({ to: '/login' });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
