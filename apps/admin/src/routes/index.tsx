import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Button, ThemeSwitcher } from '@workspace/ui/components';
import { Suspense } from 'react';
import { authQueryOptions } from '@/lib/auth/queries';

export const Route = createFileRoute('/')({
	component: HomePage,
});

/**
 * Renders the application's home page with a centered layout, informational header, footer links, and a Suspense-wrapped user action block.
 *
 * The user action block is rendered inside a Suspense boundary and displays sign-in state controls and session information when available.
 *
 * @returns A React element representing the home page.
 */
function HomePage() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
			<div className="flex flex-col items-center gap-4">
				<h1 className="text-3xl font-bold sm:text-4xl">React TanStarter</h1>
				<div className="text-foreground/80 flex items-center gap-2 text-sm max-sm:flex-col">
					This is an unprotected page:
					<pre className="bg-card text-card-foreground rounded-md border p-1">routes/index.tsx</pre>
				</div>
			</div>

			<Suspense fallback={<div className="py-6">Loading user...</div>}>
				<UserAction />
			</Suspense>

			<div className="flex flex-col items-center gap-2">
				<p className="text-foreground/80 max-sm:text-xs">
					A minimal starter template for{' '}
					<a
						className="text-foreground group"
						href="https://tanstack.com/start/latest"
						rel="noreferrer noopener"
						target="_blank"
					>
						🏝️ <span className="group-hover:underline">TanStack Start</span>
					</a>
					.
				</p>
				<div className="flex items-center gap-3" suppressHydrationWarning>
					<a
						className="text-foreground/80 hover:text-foreground underline max-sm:text-sm"
						href="https://github.com/dotnize/react-tanstarter"
						rel="noreferrer noopener"
						target="_blank"
						title="Template repository on GitHub"
					>
						dotnize/react-tanstarter
					</a>

					<ThemeSwitcher />
				</div>
			</div>
		</div>
	);
}

/**
 * Renders UI that reflects the current authentication state: shows a welcome message, dashboard link, and session JSON when a user is signed in, or a sign-in prompt with a login link when not.
 *
 * @returns A React element containing either the signed-in view (welcome text, "Go to Dashboard" button, and a JSON session block) or the signed-out view ("You are not signed in." and a "Log in" button).
 */
function UserAction() {
	const { data: user } = useSuspenseQuery(authQueryOptions());

	return user ? (
		<div className="flex flex-col items-center gap-2">
			<p>Welcome back, abc!</p>
			<Button asChild className="mb-2 w-fit" size="lg" type="button">
				<Link to="/">Go to Dashboard</Link>
			</Button>
			<div className="text-center text-xs sm:text-sm">
				Session user:
				<pre className="max-w-screen overflow-x-auto px-2 text-start">{JSON.stringify(user, null, 2)}</pre>
			</div>
		</div>
	) : (
		<div className="flex flex-col items-center gap-2">
			<p>You are not signed in.</p>
			<Button asChild className="w-fit" size="lg" type="button">
				<Link to="/login">Log in</Link>
			</Button>
		</div>
	);
}