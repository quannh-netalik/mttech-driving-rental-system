import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { routeTree } from './routeTree.gen';

/**
 * Create a TanStack Router configured with a QueryClient, sensible defaults, and SSR query integration.
 *
 * The router's context includes a `queryClient` for react-query caching and a `user` initialized to `null`.
 *
 * @returns The configured TanStack Router instance whose context contains `queryClient` and `user`.
 */
export function getRouter() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				staleTime: 1000 * 60 * 2, // 2 minutes
			},
			mutations: {
				networkMode: 'always',
			},
		},
	});

	const router = createRouter({
		routeTree,
		context: {
			queryClient,
			user: null,
		},
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 1000 * 60 * 2,
		// react-query will handle data fetching & caching
		// https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#passing-all-loader-events-to-an-external-cache
		// defaultErrorComponent: DefaultCatchBoundary,
		defaultNotFoundComponent: () => <div>Not Found</div>,
		scrollRestoration: true,
		defaultStructuralSharing: true,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
		handleRedirects: true,
		wrapQueryClient: true,
	});

	return router;
}