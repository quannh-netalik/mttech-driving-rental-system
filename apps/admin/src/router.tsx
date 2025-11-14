import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { routeTree } from './routeTree.gen';

/**
 * Creates and returns a configured TanStack Router wired to a QueryClient and SSR data integration.
 *
 * The returned router's context includes a `QueryClient` for data caching and a `user` initialized to `null`.
 * The router is configured with sensible preload, not-found, scroll restoration, and structural sharing defaults, and it is integrated with SSR query handling.
 *
 * @returns A configured TanStack Router instance with `queryClient` and `user` in its context.
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
		// react-query will handle data fetching & caching
		// https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#passing-all-loader-events-to-an-external-cache
		defaultPreloadStaleTime: 0,
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
