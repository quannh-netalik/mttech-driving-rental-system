/// <reference types="vite/client" />

import { TanStackDevtools } from '@tanstack/react-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { AppProvider } from '@workspace/ui/providers/app.provider';
import appCss from '@workspace/ui/styles/globals.css?url';
import { getUserProfileOptions, userProfileQueryKey } from '@/server/user.server';

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async ({ context }) => {
		// Use exported stable query key
		let user = context.queryClient.getQueryData(userProfileQueryKey);
		
		// Check if query is already in progress
		const queryState = context.queryClient.getQueryState(userProfileQueryKey);
		
		// Early return if user already in context (from previous beforeLoad call)
		if (context.user) {
			return;
		}
		
		// Only fetch if not in cache and not already fetching
		if (!user && queryState?.status !== 'pending') {
			console.log('Fetching user profile');
			try {
				user = await context.queryClient.ensureQueryData(getUserProfileOptions());
			} catch (_error) {
				// Silently fail
			}
		} else if (queryState?.status === 'pending') {
			// Wait for existing fetch
			try {
				user = await context.queryClient.ensureQueryData(getUserProfileOptions());
			} catch (_error) {
				// Silently fail
			}
		}
		
		if (user) {
			console.log('User profile fetched');
			context.user = user;
		}
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
				<AppProvider>{children}</AppProvider>

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
