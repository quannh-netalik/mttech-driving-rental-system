/// <reference types="vite/client" />

import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { ThemeBackground } from '@workspace/ui/components/theme-background';
import { AppProvider } from '@workspace/ui/providers';
import appCss from '@workspace/ui/styles/globals.css?url';
import { type AuthQueryResult, authQueryOptions } from '@/lib/auth/queries';

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	user: AuthQueryResult;
}>()({
	beforeLoad: ({ context }) => {
		// we're using react-query for client-side caching to reduce client-to-server calls, see /src/router.tsx
		context.queryClient.prefetchQuery(authQueryOptions());
	},
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: 'Miền Trung Tech - Admin',
			},
			{
				name: 'description',
				content: 'Hệ thống quản trị cho dịch vụ thuê xe - Miền Trung Tech',
			},
		],
		links: [
			{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
			{ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
			{ rel: 'stylesheet', href: appCss },
			{
				rel: 'icon',
				url: './images/favicon-light.png',
				href: './images/favicon-light.png',
				media: '(prefers-color-scheme: light)',
			},
			{
				rel: 'icon',
				url: './images/favicon-dark.png',
				href: './images/favicon-dark.png',
				media: '(prefers-color-scheme: dark)',
			},
		],
	}),
	component: RootComponent,
});

/**
 * Renders the application document shell with a placeholder for nested route content.
 *
 * @returns A React element containing the document shell and an <Outlet /> where child routes render.
 */
function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

/**
 * Root HTML document that wraps the application UI with providers, theming, development tools, and runtime scripts.
 *
 * Renders a complete <html> element with head content and a body that:
 * - wraps `children` with application providers and theme background,
 * - mounts TanStack devtools panels,
 * - includes runtime scripts.
 *
 * @param children - Nested route content to render inside the app provider and theme background
 * @returns The root `<html>` element for the application route
 */
function RootDocument({ children }: { readonly children: React.ReactNode }) {
	return (
		<html lang="vi" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body suppressHydrationWarning>
				<AppProvider>
					<ThemeBackground />
					{children}
				</AppProvider>

				<TanStackDevtools
					plugins={[
						{
							name: 'TanStack Query',
							render: <ReactQueryDevtoolsPanel />,
						},
						{
							name: 'TanStack Router',
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}