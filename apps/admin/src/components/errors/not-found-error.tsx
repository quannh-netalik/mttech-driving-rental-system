import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';

/**
 * Render a full-page 404 "Not Found" UI with actions to navigate away.
 *
 * The UI displays a large "404" heading, a brief explanatory message, and two action buttons:
 * - "Go Back" navigates back in browser history.
 * - "Back to Home" navigates to the application's root path (`/`).
 *
 * @returns A React element containing the 404 page UI.
 */
export function NotFoundError() {
	const navigate = useNavigate();
	const { history } = useRouter();
	return (
		<div className="h-svh">
			<div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
				<h1 className="text-[7rem] leading-tight font-bold">404</h1>
				<span className="font-medium">Oops! Page Not Found!</span>
				<p className="text-muted-foreground text-center">
					It seems like the page you're looking for <br />
					does not exist or might have been removed.
				</p>
				<div className="mt-6 flex gap-4">
					<Button onClick={() => history.go(-1)} variant="outline">
						Go Back
					</Button>
					<Button onClick={() => navigate({ to: '/' })}>Back to Home</Button>
				</div>
			</div>
		</div>
	);
}