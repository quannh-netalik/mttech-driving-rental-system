import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { BaseLayout } from '@/components/layouts/base-layout';

export const Route = createFileRoute('/(authenticated)')({
	beforeLoad: async ({ context }) => {
		if (!context.user) {
			throw redirect({ to: '/login' });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<BaseLayout>
			<Outlet />
		</BaseLayout>
	);
}
