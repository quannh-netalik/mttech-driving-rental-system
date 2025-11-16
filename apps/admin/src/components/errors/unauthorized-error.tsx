import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';

/**
 * Render a 401 Unauthorized Access screen with controls to return to the previous page or navigate home.
 *
 * @returns A JSX element containing a large "401" heading, explanatory text, and two buttons:
 * - "Go Back": navigates back one history entry
 * - "Back to Home": navigates to the root path (`/`)
 */
export function UnauthorizedError() {
	const navigate = useNavigate();
	const { history } = useRouter();
	return (
		<div className="h-svh">
			<div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
				<h1 className="text-[7rem] leading-tight font-bold">401</h1>
				<span className="font-medium">Unauthorized Access</span>
				<p className="text-muted-foreground text-center">
					Please log in with the appropriate credentials <br /> to access this resource.
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