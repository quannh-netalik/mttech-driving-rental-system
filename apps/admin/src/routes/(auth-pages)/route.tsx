import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth-pages)')({
	component: RouteComponent,
});

/**
 * Renders a centered container that hosts nested-route content.
 *
 * The layout provides vertical centering, responsive padding, and a constrained max width.
 *
 * @returns A JSX element containing a centered wrapper with an `Outlet` for nested routes.
 */
function RouteComponent() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Outlet />
			</div>
		</div>
	);
}