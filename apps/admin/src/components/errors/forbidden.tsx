import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';

/**
 * Render a 403 Access Forbidden page with actions for returning to the previous page or the home route.
 *
 * @returns A React element that displays a large "403" heading, an explanatory message, and two action buttons: "Go Back" (navigates one step back in history) and "Back to Home" (navigates to `/`).
 */
export function ForbiddenError() {
	const navigate = useNavigate();
	const { history } = useRouter();

	return (
		<div className="h-svh">
			<div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
				<h1 className="text-[7rem] leading-tight font-bold">403</h1>
				<span className="font-medium">Access Forbidden</span>
				<p className="text-muted-foreground text-center">
					You don't have necessary permission <br />
					to view this resource.
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