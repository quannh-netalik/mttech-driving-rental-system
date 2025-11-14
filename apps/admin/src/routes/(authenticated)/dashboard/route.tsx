import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(authenticated)/dashboard')({
	component: RouteComponent,
	ssr: true,
});

function RouteComponent() {
	return <div></div>;
}
